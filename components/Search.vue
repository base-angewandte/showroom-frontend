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
        :autocomplete-property-names="{ id: 'source', label: 'label', data: 'data' }"
        :is-loading-index="autocompleteLoaderIndex"
        :assistive-text="{
          selectedOption: 'Change the text of this selected option',
        }"
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
            :current-page-number="currentPageNumberInt"
            :expand-text="$t('resultsView.expand')"
            :total="section.total"
            :max-show-more-rows="resultListInt.length > 1 ? 2 : 3"
            :use-pagination="true"
            :jump-to-top="true"
            :fetch-data-externally="true"
            :use-expand-mode="useCollapsedMode"
            :max-rows="maxRows"
            :use-pagination-link-element="'nuxt-link'"
            :scroll-to-offset="55 + 16"
            class="showroom-search__results"
            @items-per-row-changed="itemsPerRow = $event">
            <template #header>
              <h4 class="showroom-search__results-header">
                {{ titleCase(headerText || section.label) }}
                <span class="showroom-search__results-header-number">
                  {{ `(${section.total})` }}
                </span>
              </h4>
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
import Vue from 'vue';
import {
  BaseAdvancedSearch,
  BaseResultBoxSection,
  BaseLoader,
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseAdvancedSearch/BaseAdvancedSearch.css';
import 'base-ui-components/dist/components/BaseResultBoxSection/BaseResultBoxSection.css';
import 'base-ui-components/dist/components/BaseLoader/BaseLoader.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters } from 'vuex';
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
     * @property {Object[]} data - the actual search results
     * @property {string} data.id - the activity id
     * @property {string} data.title - the title of the activity
     * // TODO: there seem to be some inconsistencies between API spec mock data --> clarify!
     */
    resultList: {
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
     * set page number from outside
     */
    pageNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    /**
     * placeholder for search input field to customize for entity page
     */
    placeholderText: {
      type: String,
      default: 'Search and Discover Showroom',
    },
  },
  data() {
    return {
      /**
       * store data returned from a search request and pass on to
       * BaseResultBoxSection
       * @type {Object[]}
       * @property {string} label - the label to display for the section
       * @property {number} total - total number of results available
       * @property {Object[]} data - the actual search results
       * @property {string} data.id - the activity id
       * @property {string} data.title - the title of the activity
       * // TODO: there seem to be some inconsistencies between API spec mock data --> clarify!
       */
      resultListInt: [],
      /**
       * define an initial number of items per result section row
       * (6 is the max number assuming large desktop screen)
       * @type {number}
       */
      itemsPerRow: 2,
      initialRenderDone: false,
      autocompleteTimeout: null,
      currentPageNumberInt: 1,
    };
  },
  computed: {
    /**
     * get the entity id (used now to store appliedFilters)
     * @returns {string}
     */
    entityId() {
      return this.$route.params.id || 'main';
    },
    /**
     * get the data that only need fetching once for all search components from
     * the searchData store module
     */
    ...mapGetters({
      /**
       * a list of all filters defined in the backend and available to the user
       */
      filterList: 'searchData/getFilters',
    }),
    /**
     * remove hidden filters from the filter list supplied to the component
     * (done here because hidden filters are needed to get default filter)
     * @returns {Filter[]}
     */
    displayFilterList() {
      return this.filterList.filter((filter) => !filter.hidden);
    },
    /**
     * get the default filter from the list provided by backend
     * @returns {Filter}
     */
    defaultFilter() {
      const filteredDefaultFilter = this.filterList.find((filter) => filter.id === 'fulltext');
      // either get default filter from backend provided filter list or on last resort take
      // this hardcoded default filter
      return filteredDefaultFilter ? ({
        ...filteredDefaultFilter,
        // replace label since quite a long string atm
        label: this.$t('searchView.fulltext'),
      }) : ({
        label: this.$t('searchView.fulltext'),
        id: 'fulltext',
        type: 'text',
      });
    },
    /**
     * the filters currently applied
     */
    appliedFiltersInt: {
      /**
       * get by triggering the store getter function
       * @returns {Filter[]}
       */
      get() {
        return this.appliedFilters;
      },
      set(val) {
        this.$emit('update:appliedFilters', val);
      },
    },
    maxRows() {
      // TODO: put in config? and check if different for different searches -->
      // then it should be prop
      return this.resultListInt.length > 1 ? 2 : 5;
    },
    /**
     * calculate the number of entries that should be on one page - needed for limit
     * and offset calculation for search request
     *
     * @return {number}
     */
    numberOfEntriesOnPage() {
      return this.maxRows * this.itemsPerRow;
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
        this.currentPageNumberInt = val;
        this.$emit('update:page-number', val);
      },
      get() {
        return this.pageNumber;
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
    $route(to, from) {
      let triggerSearch = false;
      // check if page is different (this is here for browser navigation as well
      // as url set by pagination component directly)
      if (from.query.page !== to.query.page) {
        if (this.currentPageNumberInt !== to.query.page) {
          this.currentPageNumberInt = Number(to.query.page);
          triggerSearch = true;
        }
        // if not - check the more complicated filters param
      } else if (from.query.filters !== to.query.filters) {
        // then first check if filters themselves differ from current applied Filters
        const routeFilters = to.query.filters ? JSON.parse(to.query.filters) : [];
        const appliedFiltersMinimized = this.appliedFiltersInt.map((filter) => ({
          id: filter.id,
          filter_values: filter.filter_values,
        }));
        if (JSON.stringify(routeFilters)
          !== JSON.stringify(appliedFiltersMinimized)) {
          this.appliedFiltersInt = routeFilters.map((filter) => {
            const filterMatch = this.filterList.find((f) => f.id === filter.id);
            return ({
              ...filterMatch,
              filter_values: filter.filter_values,
            });
          });
          triggerSearch = true;
        }
      }
      if (triggerSearch) {
        this.search(this.appliedFiltersInt);
      }
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
          this.appliedFiltersInt = { ...val };
        }
      },
      immediate: true,
    },
    resultList: {
      handler(val) {
        if (JSON.stringify(val) !== JSON.stringify(this.resultListInt)) {
          this.resultListInt = JSON.parse(JSON.stringify(val));
        }
      },
      immediate: true,
    },
    resultListInt(val) {
      if (JSON.stringify(val) !== JSON.stringify(this.resultList)) {
        this.$emit('update:result-list', val);
      }
    },
    /**
     * watch itemsPerRow since it changes on resizing and then the number of
     * displayed items should change --> retrigger search
     */
    itemsPerRow(val, old) {
      // only retrigger search if page is other than 1
      // or page is 1 and more items need to be shown than before
      if (this.currentPageNumber !== 1 || val > old) {
        this.search(this.appliedFiltersInt);
      }
    },
    /**
     * watching prop pageNumber to keep currentPageNumberInt (needed for search) in
     * sync as well
     */
    pageNumber: {
      handler(val) {
        if (this.currentPageNumberInt !== val) {
          this.currentPageNumberInt = val;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initialRenderDone = true;
    });
  },
  methods: {
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
      // get filters that should be added to search request (=only filter that have data)
      const requestFilters = filters.filter((filter) => hasData(filter.filter_values));
      // check if filters are in route already - first of all to avoid double routing but secondly
      // also because if filters are already in route this means a request was already made
      // in asyncData and search does not need to be triggered here anymore
      if (JSON.stringify(minimizedPathFilters) !== this.$route.query.filters
        && !(this.$route.query.filters === undefined && !requestFilters.length)) {
        // whenever a new search is triggered reset the page number to 1
        this.currentPageNumber = 1;
        // push the filters into the route
        await this.$router.push({
          path: this.$route.fullPath,
          query: {
            // need to user currentpagenumberint here because currentpagenumber is updated
            // via event to parent and the prop will only be updated after this function
            // went through
            page: this.currentPageNumberInt,
            filters: minimizedPathFilters.length
              ? JSON.stringify(minimizedPathFilters) : undefined,
          },
        });
        await this.search(requestFilters);
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
      // TODO: temporary data mapping for text filter so values are only string
      const filterRequestData = filters
        .map((filter) => ({
          ...filter,
          // filter_values ALWAYS needs to be array
          filter_values: [].concat(filter.type === 'chips' && filter.freetext_allowed
            ? filter.filter_values.map((value) => value.title)
            : filter.filter_values),
        }));
      /**
       * event to parent to make search happening in parent (the actual request was moved to parent
       * because the request params were to different between the views using this component)
       *
       * @event search
       * @type {Object} - an object already containing al the necessary request data
       *  @property {Filter[]} filters - the filters to be applied
       *  @property {number} offset - the request offset
       *  @property {number} limit - the number of items to be returned
       */
      this.$emit('search', {
        // filter filters that dont contain any values
        filters: filterRequestData.filter((filter) => hasData(filter.filter_values)),
        offset: (this.currentPageNumberInt - 1) * this.numberOfEntriesOnPage,
        limit: this.numberOfEntriesOnPage,
      });
    },
    /**
     * method to trigger en lang title casing
     * @param {string} string - the original string
     * @returns {string} - the title cased string
     */
    titleCase(string) {
      return toTitleString(string);
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
