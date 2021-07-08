<template>
  <div class="showroom-search">
    <client-only>
      <BaseAdvancedSearch
        :filter-list="filterList"
        :autocomplete-results="autocompleteResults"
        :advanced-search-text="$t('searchView.advancedSearchText')"
        :drop-down-info-texts="$t('searchView.dropDownInfoTexts')"
        :placeholder="$t('searchView.placeholders')"
        :autocomplete-property-names="{ collection: 'subset', data: 'data' }"
        :is-loading-index="autocompleteRequestOngoing"
        class="showroom-search__search"
        @fetch-autocomplete="fetchAutocomplete"
        @search="search" />
    </client-only>
    <template
      v-if="!searchOngoing && !searchOngoingInt">
      <template
        v-for="(section, index) in resultListInt">
        <BaseResultBoxSection
          :key="index"
          v-model="section.data"
          :show-options="false"
          :box-breakpoints="[
            [0, 2],
            [450, 3],
            [750, 4],
            [950, 5],
            [1150, 6],
          ]"
          :expand-text="$t('results.expand')"
          :total="section.total"
          :max-show-more-rows="1"
          :jump-to-top="true"
          :use-pagination="true"
          :use-expand-mode="true"
          :max-rows="2"
          class="showroom-search__results"
          @entry-clicked="goToEntry">
          <template #header>
            <h4 class="showroom-search__results-header">
              {{ section.collection }}
              <span class="showroom-search__results-header-number">
                {{ `(${section.total})` }}
              </span>
            </h4>
          </template>
        </BaseResultBoxSection>
      </template>
    </template>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  BaseAdvancedSearch,
  BaseResultBoxSection,
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseAdvancedSearch/BaseAdvancedSearch.css';
import 'base-ui-components/dist/components/BaseResultBoxSection/BaseResultBoxSection.css';

Vue.use(BaseAdvancedSearch);
Vue.use(BaseResultBoxSection);

export default {
  name: 'Search',
  props: {
    resultList: {
      type: Array,
      default: () => [],
    },
    filterList: {
      type: Array,
      default: () => [],
    },
    searchOngoing: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      autocompleteRequestOngoing: -1,
      searchOngoingInt: true,
      autocompleteResults: [],
    };
  },
  computed: {
    resultListInt: {
      set(val) {
        this.$emit('update:result-list', val);
      },
      get() {
        return this.resultList;
      },
    },
  },
  mounted() {
    this.searchOngoingInt = false;
  },
  methods: {
    async fetchAutocomplete({ searchString, filter, index }) {
      this.autocompleteRequestOngoing = index;
      const response = await this.$api.public.api_v1_autocomplete_create({
        q: searchString,
        filter_name: filter.label === 'Fulltext' ? null : filter.label,
      });
      this.autocompleteResults = JSON.parse(response.data);
      this.autocompleteRequestOngoing = -1;
    },
    async search() {
      // TODO: search
      this.searchOngoingInt = false;
    },
    goToEntry({ entryId }) {
      // TODO: is this the way to do it (image box should be router link)
      this.$router.push(entryId);
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
