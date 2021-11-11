<template>
  <div class="showroom-search">
    <client-only>
      <BaseAdvancedSearch
        :filter-list="filterList"
        :applied-filters="appliedFiltersInt"
        :default-filter="{
          label: $t('searchView.fulltext'),
          id: 'default',
          filter_values: [],
          type: 'text',
        }"
        :autocomplete-results="autocompleteResults"
        :advanced-search-text="$t('searchView.advancedSearchText')"
        :drop-down-info-texts="$t('searchView.dropDownInfoTexts')"
        :placeholder="$t('searchView.placeholders')"
        :autocomplete-property-names="{ id: 'source', label: 'label', data: 'data' }"
        :is-loading-index="autocompleteLoaderIndex"
        class="showroom-search__search"
        @main-search-active="$emit('search-active')"
        @fetch-autocomplete="fetchAutocomplete"
        @update:applied-filters="appliedFiltersInt = $event"
        @search="addFilter" />
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
        v-if="resultListInt && resultListInt.length">
        <template
          v-for="(section, index) in resultListInt">
          <BaseResultBoxSection
            :key="index"
            v-model="section.data"
            :show-options="false"
            :header-text="section.label"
            :box-breakpoints="[
              [0, 2],
              [450, 3],
              [750, 4],
              [950, 5],
              [1150, 6],
            ]"
            :expanded="resultListInt && resultListInt.length === 1"
            :current-page-number.sync="currentPageNumber"
            :expand-text="$t('results.expand')"
            :total="section.total"
            :max-show-more-rows="2"
            :use-pagination="true"
            :jump-to-top="true"
            :fetch-data-externally="true"
            :use-expand-mode="resultListInt.length > 1"
            :max-rows="maxRows"
            :use-pagination-link-element="'nuxt-link'"
            :scroll-to-offset="55 + 16"
            class="showroom-search__results"
            @items-per-row-changed="itemsPerRow = $event">
            <template #header>
              <h4 class="showroom-search__results-header">
                {{ headerText }}
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
                render-element-as="nuxt-link" />
            </template>
          </BaseResultBoxSection>
        </template>
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
import { hasData } from '../../../base-components/src/utils/utils';

Vue.use(BaseAdvancedSearch);
Vue.use(BaseResultBoxSection);
Vue.use(BaseLoader);

export default {
  name: 'Search',
  props: {
    /**
     * @type {Object[]}
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
    appliedFilters: {
      type: Array,
      default: () => [],
    },
    headerText: {
      type: String,
      default: 'Search Results',
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
     */
    autocompleteResults: {
      type: Array,
      default: () => ([]),
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
      itemsPerRow: 6,
      /**
       * variable to keep the current page number in sync and
       * trigger search in case it changes
       * @type {number}
       */
      currentPageNumber: 1,
      initialRenderDone: false,
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
     * the filters currently applied
     */
    appliedFiltersInt: {
      /**
       * get by triggering the store getter function
       * @returns {Object[]}
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
    numberOfEntriesOnPage() {
      return this.maxRows * this.itemsPerRow;
    },
  },
  watch: {
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
    $route: {
      handler(val) {
        const { page } = val.query;
        this.currentPageNumber = Number(page) || 1;
      },
      immediate: true,
    },
    currentPageNumber(val) {
      if (Number(this.$route.query.page) !== val) {
        this.$router.push({
          path: this.$route.fullPath,
          query: {
            page: val,
          },
        });
      }
      this.search(this.appliedFiltersInt);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initialRenderDone = true;
    });
  },
  methods: {
    async fetchAutocomplete(requestData) {
      this.$emit('autocomplete', requestData);
    },
    async addFilter(filters) {
      let filterRequestData = filters.filter((filter) => hasData(filter.filter_values));

      // check if filters are in route already - first of all to avoid double routing but secondly
      // also because if filters are already in route this means a request was already made
      // in asyncData and search does not need to be triggered here anymore
      if (!this.$route.query.filters || JSON.stringify(filterRequestData)
        !== JSON.stringify(JSON.parse(this.$route.query.filters))) {
        // push the filters into the route
        await this.$router.push({
          path: this.$route.fullPath,
          query: {
            page: 1,
            filters: filterRequestData.length ? JSON.stringify(filterRequestData) : '',
          },
        });

        // TODO: temporary data mapping for text filter so values are only string
        filterRequestData = filterRequestData.map((filter) => ({
          ...filter,
          filter_values: filter.type === 'text' ? filter.filter_values.map((value) => value.title)
            : filter.filter_values,
        }));
        await this.search(filterRequestData);
      }
    },
    async search(filters) {
      this.$emit('search', {
        filters,
        offset: (this.currentPageNumber - 1) * this.numberOfEntriesOnPage,
        limit: this.numberOfEntriesOnPage,
      });
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
  }
}
</style>
