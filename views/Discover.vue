<template>
  <div
    class="base-sr-discover"
    :style="{ '--fade-duration': fadeDuration + 'ms' }">
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
      :header-text="filtersHaveValues
        ? $t('resultsView.headerText.results')
        : $t('resultsView.headerText.latestActivities')"
      :no-results-text-initial="$t('discoverView.noResultsTextInitial')"
      :placeholder-text="$t('searchView.placeholders.main')"
      :class="['base-sr-discover__search', { 'base-sr-discover__search--mt-0': !initialDataMode }]"
      :date-field-delay="dateFieldDelay"
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
    store, env,
  }) {
    // this is starting with the smallest number because otherwise higher page
    // numbers are not rendered with small screensize
    const entryNumber = 2 * env.searchResultRows || 5;
    let filterList = [];
    let results = [];
    try {
      const requestsArray = [
        // get complete filterList from backend
        store.dispatch('searchData/fetchFilterData'),
        // get initial data
        store.dispatch('appData/fetchInitialData', { limit: entryNumber }),
      ];
      // wait for the requests to return
      [filterList, { results }] = await Promise
        .all(requestsArray);
    } catch (e) {
      console.error(e);
    }
    return {
      initialResults: [].concat(results),
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
      /**
       * edit-mode for different edit sections
       * @type {Object}
       */
      editMode: {
        showcase: false,
      },
      filterList: [],
      fadeDuration: 250,
      dateFieldDelay: 0,
      initialResults: [],
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
    // TODO: this is a temporary fix since hard in backend to distinguish initial heading and
    // search result heading and should be obsolete once there is more than one category
    // (bzw. a solution for more than one category)
    filtersHaveValues() {
      return this.appliedFilters.some((filter) => hasData(filter.filter_values));
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
  watch: {
    initialDataMode: {
      handler(val) {
        // some puffer for the delay
        const threshold = 50;

        // if showcase is visible, wait until fade-transition duration is done to open calendar
        const delay = this.fadeDuration + threshold;
        if (val) {
          this.dateFieldDelay = delay;
          return;
        }

        // if fade-transition is done, date calender should open immediately
        setTimeout(() => {
          this.dateFieldDelay = 0;
        }, delay);
      },
      immediate: true,
    },
  },
  created() {
    if (!this.searchResults.length) {
      this.searchResults = JSON.parse(JSON.stringify(this.getInitialData.results));
    }
  },
  methods: {
    async search(requestBody) {
      // indicate to component that search is ongoing
      this.searchOngoing = true;
      try {
        // check if there are any filters applied
        if (requestBody.filters && requestBody.filters.length) {
          // if yes apply these filters
          const { data } = await this.$api.public.api_v1_search_create({}, { requestBody });
          const parsedResults = JSON.parse(data);
          // check if there are data (this would e.g. be false if request was cancelled)
          if (parsedResults && parsedResults.data) {
            // assign search results
            this.searchResults = [].concat(parsedResults);
            this.searchOngoing = false;
          }
        } else {
          if (requestBody.offset === 0 || !this.initialSearchData) {
            // if not - refetch default data to be displayed for search
            // data are always refetched here to always have the latest results (also the
            // ones added newly from the repository) available here
            await this.$store.dispatch('appData/fetchInitialData', { limit: requestBody.limit });
            if (requestBody.offset === 0) {
              this.searchResults = this.getInitialData.results;
              this.searchOngoing = false;
            }
          }
          if (requestBody.offset !== 0) {
            const filterRequest = await this.$api.public.api_v1_search_create({}, {
              requestBody: {
                ...requestBody,
                ...this.initialSearchData,
              },
            });
            const parsedData = JSON.parse(filterRequest.data);
            // a cancelled request would return false here so need to check
            // TODO: seems not ideal to handle cancelled request this way - should go to error?
            if (parsedData) {
              this.searchResults = [parsedData];
              // move search ongoing false here so request cancellation does not stop loader
              this.searchOngoing = false;
            }
          }
        }
      } catch (e) {
        this.searchOngoing = false;
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
    },
    async fetchAutocomplete({ searchString, filter, index }) {
      // needed to add trim because space leads to evaluation true
      if (searchString && searchString.trim()) {
        this.autocompleteLoaderIndex = index;
        try {
          const response = await this.$api.public.api_v1_autocomplete_create({}, {
            requestBody: {
              q: searchString,
              filter_id: filter.id,
              limit: 20,
            },
          });

          const newResults = JSON.parse(response.data);
          // now check if parsed string is actual results (if request was cancelled this has
          // the value false
          // TODO: check if there is better solution to handle requestCancellation
          if (newResults) {
            // if yes - assign the new results (otherwise just do nothing)
            this.autocompleteResults = [].concat(newResults);
            // loader index should not be set done when request was cancelled so moving this here!
            this.autocompleteLoaderIndex = -1;
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
      } else {
        this.autocompleteResults = [];
        this.autocompleteLoaderIndex = -1;
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
  transition: all var(--fade-duration) ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
