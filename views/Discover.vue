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
import { mapGetters, mapMutations } from 'vuex';
import Showcase from '~/components/Edit/Showcase';
import Search from '~/components/Search';
import { hasData } from '~/utils/common';

export default {
  components: {
    Showcase,
    Search,
  },
  beforeRouteLeave(to, from, next) {
    const searchParams = `${this.$route.query.filters || 'noFilters'}&${this.$route.query.page || 'firstPage'}`;
    this.setSearchResults({
      id: from.params.id || 'main',
      searchParams,
      data: this.searchResults,
    });
    next();
  },
  async asyncData({
    store, env,
  }) {
    // get the entry number to request, get itemsPerRow from store which might already be
    // adjusted to the screen fitting number if router navigation was done
    const entryNumber = store.getters['appData/getItemsPerRow'] * env.searchResultRows;
    // variable to store filter list for discover page
    let filterList = [];
    try {
      const requestsArray = [
        // get complete filterList from backend
        store.dispatch('searchData/fetchFilterData'),
        // get initial data here already to have something to show in carousel on render
        store.dispatch('appData/fetchInitialData', { limit: entryNumber }),
      ];
      // wait for the requests to return but only the response of filterList
      // is necessary here
      [filterList] = await Promise
        .all(requestsArray);
    } catch (e) {
      console.error(e);
    }
    return {
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
  methods: {
    ...mapMutations({
      setSearchResults: 'searchData/setLatestSearchResults',
    }),
    /**
     * request to actually carry out search request with provided requestBody
     *
     * @param {Object} requestBody - all params necessary for the request
     * @property {Filter[]} requestBody.filters - applied filters
     * @property {number} requestBody.offset - current offset for pagination
     * @property {number} requestBody.limit - number of results to return
     */
    async search(requestBody) {
      // indicate to component that search is ongoing
      this.searchOngoing = true;
      // store in variable if filters are applied (relevant to decide which request should
      // be made
      const hasFilters = !!requestBody.filters && !!requestBody.filters.length;
      // variable to store results from the different requests
      let results = null;
      try {
        // check if this is requesting the data for the start page
        if (!hasFilters && requestBody.offset === 0) {
          // get the initial data (if not there they will be fetched via request - otherwise
          // store saved data will be used!)
          results = await this.$store.dispatch('appData/fetchInitialData', { limit: requestBody.limit });
        } else {
          // create local variable for requestBody to be able to supplement it if necessary
          let payload = requestBody;
          // if there are no filters applied we need to get the initial data filters
          if (!hasFilters) {
            payload = {
              ...requestBody,
              ...this.initialSearchData,
            };
          }
          // now make the search request
          results = await this.$store.dispatch('searchData/fetchSearch', {
            requestBody: payload,
          });
        }
        // assign the results to the component variable
        // a cancelled request would return false here so need to check
        // TODO: seems not ideal to handle cancelled request this way - should go to error?
        if (results) {
          this.searchResults = results;
          // search ongoing should only be set false if request was not cancelled to this
          // has to be done here
          this.searchOngoing = false;
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
      // set the loader of the relevant advanced search row
      this.autocompleteLoaderIndex = index;
      try {
        // get results from backend via store action
        const newResults = await this.$store.dispatch('searchData/fetchAutocomplete', {
          queryString: searchString,
          filterId: filter.id,
        });
        // TODO: check if there is better solution to handle requestCancellation
        // (is currently returned in an array as [false]
        if (newResults && (!newResults.length || !newResults.some((res) => !res))) {
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
    },
    /**
     * toggle components edit-mode (types: secondaryDetails, lists, showcase)
     *
     * @param {Object} component - { name: 'componentName', editMode: boolean }
     */
    editModeHandler({ name, editMode }) {
      // close all edit sections
      this.editMode = Object.fromEntries(Object.keys(this.editMode).map((key) => [key, false]));
      // set edit-mode for current object
      this.editMode[name] = editMode;
      // if edit mode is done refetch initial data to avoid problems with history.back() that
      // would use initialData that are not updated after edit!
      if (name === 'showcase' && !editMode) {
        const entryNumber = this.$store.getters['appData/getItemsPerRow'] * process.env.searchResultRows;
        this.$store.dispatch('appData/fetchInitialData', { limit: entryNumber, forceFetch: true });
      }
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
