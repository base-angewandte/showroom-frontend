<template>
  <div class="base-sr-discover">
    <h1 class="hide">
      {{ $t('discoverView.title') }}
    </h1>

    <client-only>
      <!-- TODO: improve transition -->
      <transition
        name="fade"
        @after-leave="fadeAfterLeave">
        <Showcase
          v-if="initialDataMode && (userCanEdit || carouselData && carouselData.length)"
          :user-can-edit="userCanEdit"
          :data="carouselData"
          :edit-mode.sync="editMode.showcase"
          :title="editMode.showcase ? $t('detailView.activityShowcase') : ''"
          @update:edit-mode="editModeHandler" />
      </transition>
    </client-only>

    <Search
      :result-list.sync="searchResults"
      :autocomplete-results="autocompleteResults"
      :applied-filters.sync="appliedFilters"
      :filter-list="filterList"
      :search-request-ongoing="searchOngoing"
      :autocomplete-loader-index="autocompleteLoaderIndex"
      :use-collapsed-mode="false"
      :page-number.sync="pageNumber"
      :no-results-text-initial="$t('discoverView.noResultsTextInitial')"
      :placeholder-text="$t('searchView.placeholders.main')"
      :class="['base-sr-discover__search', { 'base-sr-discover__search--mt-0': !initialDataMode }]"
      @autocomplete="fetchAutocomplete"
      @search="search" />

    <!-- edit-mode-background -->
    <div
      v-if="editModeIsActive"
      class="base-sr-edit-overlay" />
  </div>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters } from 'vuex';
import Showcase from '~/components/Edit/Showcase';
import Search from '~/components/Search';
import { hasData } from '~/utils/common';

export default {
  components: {
    Showcase,
    Search,
  },
  async asyncData({
    $api, query, store, env,
  }) {
    const { filters, page } = query;
    const parsedFilters = filters ? JSON.parse(filters) : [];
    // define completed filters here so they can be passed on to component in the end
    let completeFilters = [];
    // assume 2 entries and configered number of rows or 5 initially
    // TODO: make configurable??
    // this is starting with the smallest number because otherwise higher page
    // numbers are not rendered with small screensize
    const entryNumber = 2 * env.searchResultRows || 5;
    let results = [];
    // get complete filterList from backend
    const filterList = await store.dispatch('searchData/fetchFilterData');
    // get initial search results
    if (parsedFilters && parsedFilters.length) {
      completeFilters = parsedFilters.map((filter) => {
        const filterMatch = filterList.find((f) => f.id === filter.id);
        return ({
          ...filterMatch,
          filter_values: filter.filter_values,
        });
      });
      try {
        const response = await $api.public.api_v1_search_create({}, {
          requestBody: {
            // TODO: temporary fix for text filters just being strings
            filters: completeFilters.filter((filter) => hasData(filter.filter_values))
              .map((filter) => ({
                ...filter,
                // filter_values ALWAYS needs to be array
                filter_values: [].concat(filter.type === 'chips' && filter.freetext_allowed
                  ? filter.filter_values.map((value) => ((!value.id && value.title)
                    ? value.title : value))
                  : filter.filter_values),
              })),
            offset: (page ? (Number(page) - 1) : 0) * entryNumber,
            limit: entryNumber,
          },
        });
        results = [JSON.parse(response.data)];
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await store.dispatch('appData/fetchInitialData', { limit: entryNumber });
        const initialData = store.getters['appData/getInitialData'];
        if (initialData) {
          const initialResults = initialData.results;
          // TODO: this is just a temporary fix working only with one result category!
          const initialSearchData = store.getters['appData/getInitialData'].results[0].search;
          if (page > 1 && initialResults && initialResults.length) {
            const paginationResponse = await $api.public.api_v1_search_create({}, {
              requestBody: {
                ...initialSearchData,
                offset: (page ? (Number(page) - 1) : 0) * entryNumber,
                limit: entryNumber,
              },
            });
            results = [JSON.parse(paginationResponse.data)];
          } else {
            results = initialResults;
          }
        } else {
          results = [];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {
      searchResults: results,
      appliedFilters: completeFilters,
      pageNumber: page ? Number(page) : 1,
      filterList,
    };
  },
  data() {
    return {
      searchOngoing: false,
      autocompleteLoaderIndex: -1,
      searchResults: [],
      autocompleteResults: [],
      appliedFilters: [],
      pageNumber: 1,
      /**
       * edit-mode for different edit sections
       * @type {Object}
       */
      editMode: {
        showcase: false,
      },
      filterList: [],
    };
  },
  computed: {
    /**
     * get the data that only need fetching once for all search components from
     * the searchData store module
     */
    ...mapGetters({
      getInitialData: 'appData/getInitialData',
      getInitialShowcaseData: 'appData/getInitialShowcaseData',
      userEditPermissions: 'appData/getUserEditPermissions',
    }),
    carouselData() {
      return this.getInitialShowcaseData(0, false);
    },
    // save the filters from initial request in a variable so they are available
    // when changing pages
    // TODO: this only works with one result category for now!!
    initialSearchData() {
      // TODO: this is just a temporary fix working only with one result category!
      const data = this.getInitialData;
      if (data && data.results && data.results[0] && data.results[0].search) {
        return data.results[0].search;
      }
      return null;
    },
    /**
     * determine if landing page mode should be applied (for search results and
     * carousel display)
     * @returns {boolean}
     */
    initialDataMode() {
      return !this.appliedFilters || !this.appliedFilters.length
        || (this.appliedFilters.length === 1 && this.appliedFilters[0].id === 'fulltext'
        && !hasData(this.appliedFilters[0].filter_values));
    },
    /**
     * check if user is allowed to edit page elements
     *
     * @returns {boolean}
     */
    userCanEdit() {
      // get the id without name prefix
      const institutionId = process.env.institutionId.split('-').pop();
      return !!this.userEditPermissions && !!this.userEditPermissions.length
        && this.userEditPermissions.includes(institutionId);
    },
    /**
     * check if some edit-mode is active
     *
     * @returns {boolean}
     */
    editModeIsActive() {
      return Object.values(this.editMode).some((value) => value !== false);
    },
  },
  methods: {
    async search(requestBody) {
      // indicate to component that search is ongoing
      this.searchOngoing = true;
      try {
        // check if there are any filters applied
        if (requestBody.filters && requestBody.filters.length) {
          // if yes apply these filters
          // TODO: dont need to send options to backend --> get rid of this somehow?
          // or do this in BaseAdvancedSearch even
          const { data } = await this.$api.public.api_v1_search_create({}, { requestBody });
          const parsedResults = JSON.parse(data);
          // check if there are data (this would e.g. be false if request was cancelled)
          if (parsedResults && parsedResults.data) {
            // assign search results
            this.searchResults = [].concat(parsedResults);
          }
        } else {
          if (requestBody.offset === 0 || !this.initialSearchData) {
            // if not - refetch default data to be displayed for search
            // data are always refetched here to always have the latest results (also the
            // ones added newly from the repository) available here
            await this.$store.dispatch('appData/fetchInitialData', { limit: requestBody.limit });
            if (requestBody.offset === 0) {
              this.searchResults = this.getInitialData.results;
            }
          }
          if (requestBody.offset !== 0) {
            const filterRequest = await this.$api.public.api_v1_search_create({}, {
              requestBody: {
                ...requestBody,
                ...this.initialSearchData,
              },
            });
            this.searchResults = [JSON.parse(filterRequest.data)];
          }
        }
      } catch (e) {
        // TODO: error handling (unify at one place??)
        // TODO: restore previous state of search?
        console.error(e);
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.searchError'),
          text: this.$t('notify.searchErrorSubtext'),
          type: 'error',
        });
      }
      this.searchOngoing = false;
    },
    async fetchAutocomplete({ searchString, filter, index }) {
      // needed to add trim because space leads to evaluation true
      if (searchString && searchString.trim()) {
        this.autocompleteLoaderIndex = index;
        try {
          const response = await this.$api.public.api_v1_autocomplete_create({}, {
            requestBody: {
              q: searchString,
              filter_id: filter.label === this.$t('searchView.fulltext') ? 'fulltext' : filter.id,
            },
          });

          // check if response.data is typeof string before processing value.
          // response.data could also be a blob due to request cancellation.
          // TODO: check if there is better solution to handle requestCancellation
          if (typeof response.data === 'string') {
            // TODO: response should be an array always so remove concat as soon as this is the case
            this.autocompleteResults = [].concat(JSON.parse(response.data));
          }
        } catch (e) {
          this.autocompleteLoaderIndex = -1;
          this.autocompleteResults = [];
          console.error(e);
          // TODO: error handling
          // TODO: show this information in autocomplete drop down as well?
          // TODO: reset autocompleteResults??
          console.error(e);
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.autocompleteError'),
            text: this.$t('notify.autocompleteErrorSubtext'),
            type: 'error',
          });
        }
        this.autocompleteLoaderIndex = -1;
      } else {
        this.autocompleteResults = [];
      }
    },
    /**
     * toggle components edit-mode (types: secondaryDetails, lists, showcase)
     *
     * @param {Object} component - { name: 'componentName', editMode: boolean }
     */
    editModeHandler(component) {
      // close all edit sections
      this.editMode = Object.fromEntries(Object.keys(this.editMode).map((key) => [key, false]));
      // set edit-mode for current object
      this.editMode[component.name] = component.editMode;
    },
    /**
     * animation fade after leave
     */
    fadeAfterLeave() {
      // scroll to top, when showcase is hidden
      if (!this.initialDataMode) {
        window.scroll(0, 0);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.base-sr-discover {
  min-height: 100vh;

  .base-sr-discover__search {
    margin-top: $spacing;

    &.base-sr-discover__search--mt-0 {
      margin-top: 0;
    }
  }
}

.fade-enter-active, .fade-move, .fade-leave-active {
  transition: all 250ms ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
