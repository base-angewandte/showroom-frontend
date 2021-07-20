<template>
  <div class="showroom-search">
    <client-only>
      <BaseAdvancedSearch
        :filter-list="filterList"
        :applied-filters="appliedFilters"
        :autocomplete-results="autocompleteResults"
        :advanced-search-text="$t('searchView.advancedSearchText')"
        :drop-down-info-texts="$t('searchView.dropDownInfoTexts')"
        :placeholder="$t('searchView.placeholders')"
        :autocomplete-property-names="{ id: 'source', label: 'label', data: 'data' }"
        :is-loading-index="autocompleteRequestOngoing"
        class="showroom-search__search"
        @fetch-autocomplete="fetchAutocomplete"
        @update:applied-filters="appliedFilters = $event"
        @search="search" />
    </client-only>
    <template
      v-if="!searchOngoing">
      <template
        v-for="(section, index) in resultList">
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
          :expanded="expandedSection && expandedSection.collection === section.collection"
          :current-page-number="expandedSection && expandedSection.collection === section.collection
            ? expandedSection.page : 1"
          :expand-text="$t('results.expand')"
          :total="section.total"
          :max-show-more-rows="1"
          :use-pagination="true"
          :show-header="resultList.length > 1"
          :use-expand-mode="resultList.length > 1"
          :max-rows="2"
          :use-pagination-link-element="'nuxt-link'"
          class="showroom-search__results">
          <template #header>
            <h4 class="showroom-search__results-header">
              {{ section.label }}
              <span class="showroom-search__results-header-number">
                {{ `(${section.total})` }}
              </span>
            </h4>
          </template>
          <template #resultBox="{ item }">
            <BaseImageBox
              :key="item.id"
              :title="item.title"
              :subtext="item.subtext"
              :description="item.description"
              :image-url="item.imageUrl"
              :link-to="item.id"
              render-element-as="nuxt-link" />
          </template>
        </BaseResultBoxSection>
      </template>
    </template>
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
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseAdvancedSearch/BaseAdvancedSearch.css';
import 'base-ui-components/dist/components/BaseResultBoxSection/BaseResultBoxSection.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters, mapMutations } from 'vuex';

Vue.use(BaseAdvancedSearch);
Vue.use(BaseResultBoxSection);

export default {
  name: 'Search',
  props: {
    /**
     * if a section and page is specified in the route use this prop
     * to set it expanded and on the page specified<br>
     * object props: collection, page
     */
    expandedSection: {
      type: Object,
      default: null,
      validator: (val) => !Object.keys(val).some((key) => !['collection', 'page'].includes(key)),
    },
    /**
     * specify the operationId for /search/ requests as specified in the OpenAPI schema
     */
    searchRequestOperationId: {
      type: String,
      default: 'api_v1_search_create',
    },
    /**
     * specify the operationId for /autcomplete/ requests as specified in the OpenAPI schema
     */
    autocompleteRequestOperationId: {
      type: String,
      default: 'api_v1_autocomplete_create',
    },
    /**
     * specify which categories should be available (currently only 'activities'
     * for entity page!)
     */
    availableCategories: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      /**
       * keep track of a ongoing autocomplete request
       * @type {number}
       */
      autocompleteRequestOngoing: -1,
      /**
       * variable to navigate display of searchResults
       * --> if search is ongoing dont display
       * starting of as 'true' to not immediately display search results
       * @type {boolean}
       */
      searchOngoing: true,
      /**
       * variable to store autocomplete response data and pass on to
       * Search component
       * @type {Object[]}
       * @property {string} source - id of the section to display
       * @property {string} label - the label to display for the category
       * @property {AutocompleteItem[]} data - the actual autocomplete results
       */
      autocompleteResults: [],
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
      resultList: [],
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
      /**
       * a list of all categories defined in the backend
       */
      categories: 'searchData/getCategories',
      /**
       * a function to get the currently appliedfilters for the respective
       * entity by entityId
       */
      getAppliedFilters: 'searchData/getAppliedFiltersById',
    }),
    /**
     * the filters currently applied
     */
    appliedFilters: {
      /**
       * get by triggering the store getter function
       * @returns {Object[]}
       */
      get() {
        return this.getAppliedFilters(this.entityId);
      },
      /**
       * set by triggering the store mutation
       * @param val
       */
      set(val) {
        this.setAppliedFilters({ id: this.entityId, filters: val });
      },
    },
    /**
     * only display categories specified by parent - if none were specified
     * use all categories
     * @returns {Object[]}
     */
    displayCategories() {
      return this.availableCategories || this.categories;
    },
  },
  watch: {
    appliedFilters(val) {
      if (JSON.stringify(val) !== JSON.stringify(this.getAppliedFilters(this.entityId))) {
        this.setAppliedFilters({ id: this.entityId, filters: val });
      }
    },
  },
  created() {
    // check if appliedFilters are available
    const initialFilters = this.getAppliedFilters(this.entityId);
    // if not create an entry in the storage object in the store
    if (!initialFilters) {
      this.appliedFilters = [];
      this.setAppliedFilters({ id: this.entityId, filters: this.appliedFilters });
    } else {
      this.appliedFilters = initialFilters;
    }
  },
  mounted() {
    this.searchOngoing = false;
  },
  methods: {
    ...mapMutations({
      setAppliedFilters: 'searchData/setAppliedFilters',
    }),
    async fetchAutocomplete({ searchString, filter, index }) {
      this.autocompleteRequestOngoing = index;
      try {
        const response = await this.$api.public[this.autocompleteRequestOperationId]({
          q: searchString,
          filter_name: filter.label === 'Fulltext' ? null : filter.label,
        });
        this.autocompleteResults = JSON.parse(response.data);
      } catch (e) {
        console.error(e);
        // TODO: error handling
      }
      this.autocompleteRequestOngoing = -1;
    },
    async search(filters) {
      this.searchOngoing = true;
      try {
        const results = [];
        // TODO: dont need to send options to backend --> get rid of this somehow?
        // or do this in BaseAdvancedSearch even
        this.displayCategories.forEach((category) => {
          results.push(this.$api.public[this.searchRequestOperationId]({}, {
            requestBody: {
              filters,
              category,
            },
          }));
        });
        const data = await Promise.all(results);
        this.resultList = data.map((response) => JSON.parse(response.data));
      } catch (e) {
        console.error(e);
        // TODO: error handling
      }
      this.searchOngoing = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.showroom-search {
  .showroom-search__search {
    margin-bottom: $spacing-large;
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
</style>
