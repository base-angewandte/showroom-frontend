<template>
  <div class="showroom-search">
    <client-only>
      <BaseAdvancedSearch
        :filter-list="displayFilterList"
        :applied-filters.sync="appliedFiltersInt"
        :default-filter="defaultFilter"
        :autocomplete-results="autocompleteResults"
        :advanced-search-text="$t('searchView.advancedSearchText')"
        :drop-down-info-texts="$t('searchView.dropDownInfoTexts')"
        :placeholder="{
          main: {
            text: placeholderText || $t('searchView.placeholders.main'),
            chips: $t('searchView.placeholders.chips'),
            date: $t('searchView.placeholders.date'),
          },
          filterRow: {
            text: $t('searchView.placeholders.filterRow'),
            chips: $t('searchView.placeholders.chips'),
            date: $t('searchView.placeholders.date'),
          },
        }"
        :autocomplete-property-names="{ id: 'filter_id', label: 'label', data: 'data' }"
        :is-loading-index="autocompleteLoaderIndex"
        :assistive-text="{
          selectedOption: 'Change the text of this selected option',
        }"
        :date-field-delay="dateFieldDelay"
        :language="$i18n.locale"
        class="showroom-search__search"
        @fetch-autocomplete="fetchAutocomplete"
        @search="fetchSearchResults" />
    </client-only>

    <div
      :class="['showroom-search__results-area',
               { 'showroom-search__results-area__hidden': !initialRenderDone }]">
      <div
        v-if="initialRenderDone && searchRequestOngoing"
        class="showroom-search__loader-overlay">
        <BaseLoader
          class="showroom-search__loader" />
      </div>
      <template
        v-if="resultListInt && resultListInt.length && resultListHasData">
        <template
          v-for="(section, index) in resultListInt">
          <BaseResultBoxSection
            :key="index"
            v-model="section.data"
            :show-options="false"
            :header-text="titleCase(headerText || section.label)"
            :box-breakpoints="[
              [0, 2],
              [450, 3],
              [750, 4],
              [950, 5],
              [1150, 6],
            ]"
            :expanded="!useCollapsedMode"
            :current-page-number="currentPageNumber"
            :expand-text="$t('resultsView.expand')"
            :total="section.total"
            :max-show-more-rows="resultListInt.length > 1 ? 2 : 3"
            :use-pagination="true"
            :jump-to-top="true"
            :fetch-data-externally="true"
            :use-expand-mode="useCollapsedMode"
            :initial-items-per-row="getItemsPerRow"
            :max-rows="maxRows"
            :use-pagination-link-element="'nuxt-link'"
            :scroll-to-offset="55 + 16"
            class="showroom-search__results"
            @items-per-row-changed="setItemsPerRow($event)">
            <template #header>
              <h2 class="showroom-search__results-header">
                {{ titleCase(headerText || section.label) }}
                <span class="showroom-search__results-header-number">
                  {{ `(${section.total})` }}
                </span>
              </h2>
            </template>
            <template #resultBox="{ item }">
              <BaseImageBox
                :key="item.id"
                :title="item.title"
                :subtext="item.subtitle"
                :description="item.description"
                :image-url="item.image_url"
                :link-to="item.id"
                :box-text="item.alternative_text"
                :lazyload="true"
                render-element-as="nuxt-link" />
            </template>
          </BaseResultBoxSection>
        </template>
      </template>
      <template v-else>
        <div class="showroom-search__no-results-area">
          <h5
            v-if="!searchRequestOngoing"
            class="showroom-search__no-results__header">
            {{ filtersApplied ? $t('searchView.noResultsHeading')
              : $t('searchView.noResultsInitial') }}
          </h5>
          <p
            v-if="!searchRequestOngoing"
            class="showroom-search__no-results__text">
            {{ filtersApplied ? $t('searchView.noResultsText')
              : noResultsTextInitial }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
/**
 * an item (e.g. activity, album or entity) in the autocomplete data
 *
 * @typedef {Object} AutocompleteItem
 * @property {string} id - the id of a result entry
 * @property {string} title - the title of a result entry
 * @property {string[]} subtext - additional text displayed after title
 * @property {string} source - the source of the autocomplete item
 */

/**
 * @typedef Filter
 * @property {string} label|* - property 'label' indicating the label or an equivalent
 *  custom property defined in prop labelPropertyName.filter
 * @property {string} id|* - property 'id' used as unique identifier or an equivalent
 *  custom property defined in prop identifierPropertyName.filter
 * @property {string} type - a filter type defining the type of search element shown
 *  @values text, chips, date, daterange
 * @property {boolean} [hidden] - exclude filters that have this attribute true from display
 * @property {boolean} [freetext_allowed] - property specifc for type: chips determining
 *  if options are autocompleted (true) or used from the options property (false)
 * @property {Object[]} [options] - the options used for chips filter types with
 *  freetext_allowed false
 * @property {Object[]|string[]|string|Object} [filter_values] - the values a filter contains - only
 *  relevant for applied filters, not for filters coming from backend presented in the drop down
 */

/**
 * @typedef ResultListItem
 * @property {string} id - the result item id
 * @property {string} type - the type of the result item (e.g. 'activity', 'person')
 * @property {string} title - the title of the result item
 * @property {string} subtitle - the result item second line of text after title
 * @property {string} description - text line displayed at the bottom of result box
 *  (e.g. contains type of actvitiy)
 * @property {string[]} alternative_text - array with text that is displayed when there
 *  is no image available
 * @property {string} image_url - url for the image displayed in result box
 * @property {Object} source_institution - source repository object incl. label and url
 *  (and icon in theory)
 *
 */
import Vue from 'vue';
import {
  BaseAdvancedSearch,
  BaseResultBoxSection,
  BaseLoader,
} from 'base-ui-components';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters, mapMutations } from 'vuex';

import 'base-ui-components/dist/components/BaseAdvancedSearch/BaseAdvancedSearch.css';
import 'base-ui-components/dist/components/BaseResultBoxSection/BaseResultBoxSection.css';
import 'base-ui-components/dist/components/BaseLoader/BaseLoader.css';
import { hasData, toTitleString } from '~/utils/common';

Vue.use(BaseAdvancedSearch);
Vue.use(BaseResultBoxSection);
Vue.use(BaseLoader);

export default {
  name: 'Search',
  props: {
    /**
     * @property {string} label - the label to display for the section
     * @property {number} total - total number of results available
     * @property {ResultListItem[]} data - the actual search results
     */
    resultList: {
      type: Array,
      default: () => [],
    },
    /**
     * the list of filters to be displayed in the drop down allowing the user to choose
     * @type {Filter[]}
     */
    filterList: {
      type: Array,
      default: () => [],
    },
    /**
     * array of currently applied filters (might be set by parent if filters were
     * parsed from url on page load)
     * @type {Filter[]}
     */
    appliedFilters: {
      type: Array,
      default: () => [],
    },
    headerText: {
      type: String,
      default: '',
    },
    noResultsTextInitial: {
      type: String,
      default: '',
    },
    searchRequestOngoing: {
      type: Boolean,
      default: false,
    },
    autocompleteLoaderIndex: {
      type: Number,
      default: -1,
    },
    /**
     * variable to store autocomplete response data and pass on to
     * Search component
     * @type {AutocompleteItem[]}
     */
    autocompleteResults: {
      type: Array,
      default: () => ([]),
    },
    /**
     * set from outside if 'show more' should be used (only true for main search
     * initial mode, never for Details view)
     */
    useCollapsedMode: {
      type: Boolean,
      default: false,
    },
    /**
     * placeholder for search input field to customize for entity page
     */
    placeholderText: {
      type: String,
      default: 'Search and Discover Showroom',
    },
    /**
     * use this prop to set a delay in ms before date input calender is displayed
     */
    dateFieldDelay: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      /**
       * store data returned from a search request and pass on to
       * BaseResultBoxSection
       * @type {ResultListItem[]}
       */
      resultListInt: [],
      /**
       * variable to determine if showcase should be shown
       * @type {boolean}
       */
      initialRenderDone: false,
      /**
       * store autocomplete timeout in a variable to be able to cancel and reset
       * if necessary
       * @type {?number}
       */
      autocompleteTimeout: null,
      /**
       * for internal handling of current page number for BasePagination
       */
      currentPageNumberInt: 1,
      /**
       * the currently applied filters
       * @type {Filter[]}
       */
      appliedFiltersInt: [],
    };
  },
  computed: {
    ...mapGetters({
      getStoredData: 'searchData/getLatestSearchResults',
      getItemsPerRow: 'appData/getItemsPerRow',
    }),
    /**
     * get the entity id (used now to store appliedFilters)
     * @returns {string}
     */
    entityId() {
      return this.$route.params.id || 'main';
    },
    storedData() {
      return this.getStoredData(this.entityId);
    },
    /**
     * remove hidden filters from the filter list supplied to the component
     * (done here because hidden filters are needed to get default filter)
     * @returns {Filter[]}
     */
    displayFilterList() {
      return this.filterList && this.filterList.length
        ? this.filterList.filter((filter) => !filter.hidden) : [];
    },
    /**
     * get the default filter from the list provided by backend
     * @returns {Filter}
     */
    defaultFilter() {
      // define fallbackfilter
      const fallbackFilter = {
        label: this.$t('searchView.fulltext'),
        id: 'fulltext',
        type: 'text',
      };
      // check if filterList is present
      if (this.filterList && this.filterList.length) {
        // either get default filter from backend provided filter list or on last resort take
        // this hardcoded default filter
        return this.filterList.find((filter) => filter.id === 'fulltext') || fallbackFilter;
      }
      // else just return fallback filter
      return fallbackFilter;
    },
    maxRows() {
      // TODO: check if different for different searches -->
      // then it should be prop
      return this.resultListInt.length > 1 ? 2 : process.env.searchResultRows;
    },
    /**
     * calculate the number of entries that should be on one page - needed for limit
     * and offset calculation for search request
     *
     * @return {number}
     */
    numberOfEntriesOnPage() {
      return this.maxRows * this.getItemsPerRow;
    },
    /**
     * returns if any of the resultList sections has values to determine
     * if BaseResultBoxSection should be shown
     *
     * @returns {boolean}
     */
    resultListHasData() {
      return this.resultListInt.some((section) => hasData(section.data));
    },
    /**
     * variable to keep the current page number in sync and
     * trigger search in case it changes
     */
    currentPageNumber: {
      set(val) {
        // need internal representation that is immediately updated as well for search request
        this.currentPageNumberInt = val || 1;
        this.$emit('update:page-number', this.currentPageNumberInt);
      },
      get() {
        return this.currentPageNumberInt;
      },
    },
    /**
     * determine if filters are currently applied to determine results section heading
     * @returns {boolean}
     */
    filtersApplied() {
      return (this.appliedFiltersInt && this.appliedFiltersInt.length > 1)
      || (this.appliedFiltersInt.length === 1 && hasData(this.appliedFiltersInt[0].filter_values));
    },
  },
  watch: {
    /**
     * basically search is always triggered just by watching the url with one exception -
     * if itemsPerRow changes (mostly on resize) this will separately trigger search
     * (this can not be set immediate because prop filterList is necessary which is not
     * available when $route changes for the first time)
     *
     * @param {Object} to - the new url
     * @param {Object} from - the previous url
     */
    $route(to, from) {
      // call the function for checking url and parse params
      this.parseUrlForSearch(to, from);
    },
    appliedFiltersInt: {
      handler(val) {
        if (JSON.stringify(val) !== JSON.stringify(this.appliedFilters)) {
          this.$emit('update:applied-filters', val);
        }
      },
      immediate: true,
    },
    appliedFilters: {
      handler(val) {
        if (JSON.stringify(val) !== JSON.stringify(this.appliedFiltersInt)) {
          this.appliedFiltersInt = JSON.parse(JSON.stringify(val));
        }
      },
      immediate: true,
    },
    resultList: {
      /**
       * watch prop resultList to update internal variable if necessary
       * @param {ResultListItem[]} val - the value provided by parent
       */
      handler(val) {
        if (JSON.stringify(val) !== JSON.stringify(this.resultListInt)) {
          this.resultListInt = JSON.parse(JSON.stringify(val));
        }
      },
      immediate: true,
    },
    /**
     * watch internal resultListInt to notify parent of changes if necessary
     * @param {ResultListItem[]} val - the new internal value
     */
    resultListInt(val) {
      if (JSON.stringify(val) !== JSON.stringify(this.resultList)) {
        this.$emit('update:result-list', val);
      }
    },
    /**
     * watch itemsPerRow since it changes on resizing and then the number of
     * displayed items should change --> retrigger search
     */
    getItemsPerRow(val, old) {
      // get new offset
      const proposedOffset = (this.currentPageNumber - 1) * this.numberOfEntriesOnPage;
      // check if current page number is not covered anymore if more items fit on one page than
      // before - if so set page to keep previous offset item in view
      if (this.currentPageNumber > 1 && old < val
        && proposedOffset > this.resultListInt[0].total) {
        // get first previous item number
        const firstPreviousItem = (old * this.maxRows * (this.currentPageNumber - 1)) + 1;
        // set current page number to the page the first previous item should be on now
        this.currentPageNumber = Math.ceil(firstPreviousItem / this.numberOfEntriesOnPage)
          || 1;
        // set router accordingly (this will trigger search as well)
        this.$router.push({
          path: this.$route.fullPath,
          query: {
            page: this.currentPageNumber,
          },
        });
        // only retrigger search if page is other than 1
        // or page is 1 and more items need to be shown than before
      } else if (this.currentPageNumber !== 1 || val > old) {
        this.search(this.appliedFiltersInt);
      }
    },
  },
  mounted() {
    const { page, filters } = this.$route.query;
    // there should be an initial search request (if necessary parsing url) - however
    // this only works if filterList is there! so checking here (but it should be here)
    // filterList is also the reason why this is here instead of setting $route watcher to
    // immediate (filterList not available yet)
    if (this.filterList && this.filterList.length) {
      // check if url query params are set
      if ((page && page !== '1') || filters) {
        // if yes - parse them
        this.parseUrlForSearch(this.$route);
      } else {
        // else just trigger regular search without filters
        this.search([]);
      }
    }
    this.$nextTick(() => {
      this.initialRenderDone = true;
    });
  },
  methods: {
    ...mapMutations({
      setItemsPerRow: 'appData/setItemsPerRow',
    }),
    /**
     * function triggered by the BaseAdvancedSearch component as soon as typing in any filter row
     * occurs
     *
     * @param {Object} requestData - the data needed for autocomplete functionality to work
     *  @property {string} requestData.searchString - the string to autocomplete
     *  @property {Filter} requestData.filter - the filter that triggered the event
     *  @property {number} requestData.index - the index of the filter in the appliedFilters array
     */
    async fetchAutocomplete(requestData) {
      if (this.autocompleteTimeout) {
        clearTimeout(this.autocompleteTimeout);
        this.autocompleteTimeout = null;
      }
      // add a minimal delay in autocomplete fetch request to reduce requests
      // while typing
      this.autocompleteTimeout = setTimeout(() => {
        this.$emit('autocomplete', requestData);
      }, 300);
    },
    /**
     * function triggered when filters change in BaseAdvancedSearch, responsible for adjusting
     * url query params and triggering actual search (bzw. search event to parent respectively)
     *
     * @param {Filter[]} filters - the filters applied as determined by BaseAdvancedSearch component
     */
    async fetchSearchResults(filters) {
      // to keep url as tiny as possible strip everything unnecessary from the filter
      const minimizedPathFilters = filters.map((filter) => ({
        id: filter.id,
        filter_values: filter.filter_values,
      }));
      const previousQueryFilterString = this.$route.query.filters;
      const newFilterIsEmptyFilter = minimizedPathFilters.length === 1
        && !(hasData(minimizedPathFilters[0].filter_values));
      const newFilterIsEmptyDefaultFilter = newFilterIsEmptyFilter
        && minimizedPathFilters[0].id === this.defaultFilter.id;
      // check if filters are in route already - first of all to avoid double routing but secondly
      // also because if filters are already in route this means a request was already made
      // in asyncData and search does not need to be triggered here anymore
      if (JSON.stringify(minimizedPathFilters) !== previousQueryFilterString
        // cover special case empty fulltext filter that is removed from route query string
        && !(newFilterIsEmptyDefaultFilter && !previousQueryFilterString)) {
        // need to check if change was just an empty filter because this should
        // not reset the page
        const changeWasEmptyFilter = JSON.stringify(minimizedPathFilters
          .filter((filter) => hasData(filter.filter_values)))
          === JSON.stringify(previousQueryFilterString
            ? JSON.parse(previousQueryFilterString)
              .filter((filter) => hasData(filter.filter_values)) : []);
        // so only reset page to 1 if some filter values actually changed
        if (!changeWasEmptyFilter) {
          // whenever a new search is triggered (and it was not triggered by setting a filter type)
          // reset the page number to 1
          this.currentPageNumber = 1;
        }
        // push the filters into the route - this will automatically trigger the search!!
        await this.$router.push({
          path: this.$route.fullPath,
          query: {
            // since page number is 1 here just remove it from the url query string
            page: undefined,
            filters: minimizedPathFilters.length
              // dont add empty default filter
              && !newFilterIsEmptyDefaultFilter
              ? JSON.stringify(minimizedPathFilters) : undefined,
          },
        });
      }
    },
    /**
     * the actual search function triggering an event to the parent component where the actual
     * search is done
     * triggered either by modifying filters in BaseAdvancedSearch,
     * a page change or a window resize and the number of items displayed changes the correct offset
     *
     * @param {Filter[]} filters - the filters to be applied in search
     */
    async search(filters) {
      // need to assemble manually in case there are not filters or no page
      const queryParams = `${this.$route.query.filters || 'noFilters'}&${this.$route.query.page || 'firstPage'}`;
      if (this.storedData
        && (this.storedData[queryParams] && this.storedData[queryParams])) {
        // once the stored data was used reset it in the store
        this.resultListInt = JSON.parse(JSON
          .stringify(this.storedData[queryParams]));
      } else {
        const filterRequestData = filters
          .map((filter) => ({
            // get rid of all other filter properties
            id: filter.id,
            type: filter.type,
            // filter_values ALWAYS needs to be array
            filter_values: [].concat(filter.type === 'chips' && filter.freetext_allowed
              ? filter.filter_values.map((value) => ((!value.id && value.title)
                ? value.title : value))
              : filter.filter_values),
          }));
        /**
         * event to parent to make search happening in parent (the actual request was moved to
         * parent because the request params were to different between the views using this
         * component)
         *
         * @event search
         * @type {Object} - an object already containing al the necessary request data
         *  @property {Filter[]} filters - the filters to be applied
         *  @property {number} offset - the request offset
         *  @property {number} limit - the number of items to be returned
         */
        this.$emit('search', {
          // filter filters that dont contain any values
          filters: filterRequestData.filter((filter) => hasData(filter.filter_values)) || [],
          offset: (this.currentPageNumber - 1) * this.numberOfEntriesOnPage,
          limit: this.numberOfEntriesOnPage,
        });
      }
    },
    /**
     * method to trigger en lang title casing
     * @param {string} string - the original string
     * @returns {string} - the title cased string
     */
    titleCase(string) {
      return toTitleString(string);
    },
    parseUrlForSearch(to, from) {
      // variable to indicate if search should be triggered in the end
      let triggerSearch = false;
      // get the past url filter string
      const fromFilters = from ? from.query.filters : null;
      // get the new url filter string
      const toFilters = to.query.filters;
      // get the new page number and make it a number
      const newPageNumber = Number(to.query.page);
      // check if page is different (this is here for browser navigation as well
      // as url set by pagination component directly)
      if (((!from && to.query.page > 1)
        || (from && from.query.page !== to.query.page))
        && !((!from || !from.query.page) && !to.query.page)) {
        if (this.currentPageNumber !== newPageNumber) {
          this.currentPageNumber = Number(to.query.page || 1);
          triggerSearch = true;
        }
      }
      // check the more complicated filters param
      if (fromFilters !== toFilters) {
        // parse the new url filter string if present - they are used to set the
        // applied filters variable
        const routeToFilters = toFilters ? JSON.parse(toFilters) : [];
        // parse the old url filter string if present - this is just for comparison
        // purposes (if filters in route have changed)
        // const routeFromFilters = fromFilters ? JSON.parse(fromFilters) : [];
        // match the new parsed filters with the filterList filters that contain all
        // necessary data
        this.appliedFiltersInt = routeToFilters.map((filter) => {
          const filterMatch = this.filterList.find((f) => f.id === filter.id);
          return ({
            // add all properties from the matched filterList filter
            ...filterMatch,
            // except keep the filter_values
            filter_values: filter.filter_values,
          });
        });
        triggerSearch = true;
      }
      if (triggerSearch) {
        this.search(this.appliedFiltersInt);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.showroom-search {
  .showroom-search__search {
    margin-bottom: $spacing-large;
  }

  .showroom-search__results-area {
    position: relative;
    height: 100%;
    width: 100%;

    &.showroom-search__results-area__hidden {
      visibility: hidden;
    }

    .showroom-search__loader-overlay {
      position: absolute;
      background: $loading-background;
      z-index: map-get($zindex, loader);
      height: calc(100% + (2 * #{$spacing}));
      width: 100%;
      top: -$spacing;
    }

    .showroom-search__results {
      margin-bottom: $spacing-large;

      .showroom-search__results-header {
        padding: 0 $spacing;

        .showroom-search__results-header-number {
          font-size: $font-size-small;
          color: $font-color-third;
          font-weight: normal;
        }
      }
    }

    .showroom-search__no-results-area {
      width: 100%;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      color: $font-color-second;
      padding: 0 $spacing;

      .showroom-search__no-results__header {
        font-weight: normal;
        font-size: $font-size-large;
      }

      .showroom-search__no-results__text {
        white-space: pre-line;
      }

      .showroom-search__no-results-button {
        margin-top: $spacing;
        background: white;
        align-self: flex-start;
      }
    }
  }
}
</style>
