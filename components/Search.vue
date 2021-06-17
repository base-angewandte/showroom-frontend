<template>
  <div class="showroom-search">
    <client-only>
      <BaseAdvancedSearch
        :filter-list="filterList"
        :autocomplete-results="autocompleteResults"
        :advanced-search-text="{
          title: 'A longer longer longer test string',
          subtext: 'Select a filter',
          availableOptions: 'Available options',
          addFilter: 'Add filter',
          removeFilter: 'Remove filter',
          selectFilterLabel: 'Select filter',
          searchLabel: 'Search for Entries',
        }"
        :autocomplete-property-names="{ collection: 'subset', data: 'data' }"
        :is-loading-index="autocompleteRequestOngoing"
        class="showroom-search__search"
        @fetch-autocomplete="fetchAutocomplete" />
    </client-only>
    <template
      v-for="(section, index) in resultListInt">
      <BaseResultBoxSection
        :key="index"
        v-model="section.data"
        :show-options="false"
        :box-breakpoints="[
          [0, 1],
          [200, 2],
          [400, 3],
          [600, 4],
          [800, 5],
        ]"
        :expand-text="$t('results.expand')"
        :total="section.data.length"
        :max-show-more-rows="1"
        :jump-to-top="true"
        :use-pagination="true"
        :use-expand-mode="true"
        :max-rows="2"
        class="showroom-search__results">
        <template #header>
          <h4 class="showroom-search__results-header">
            {{ section.label }}
            <span class="showroom-search__results-header-number">
              {{ `(${section.data.length})` }}
            </span>
          </h4>
        </template>
      </BaseResultBoxSection>
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
  },
  data() {
    return {
      autocompleteRequestOngoing: -1,
      autocompleteResults: [],
      // eslint-disable-next-line
      autocompleteResultsOriginal: [{ subset: 'Current Art Works', data: [{ id: 'i:AtyPMbCGvo87shMwRZikwQ', score: 13.0, title: 'Zebra - Zentrum für Klassische und Moderne Fotografie', subtext: ['Wien, Austria'] }, { id: 'i:kK2kZPzffLknjWhuHxU6sa', score: 13.0, title: 'Zentrum für Erwachsenenbildung', subtext: ['Strobl']}, { id: 'i:QpNo2ZUPzPKM7wJDSy7F4h', score: 13.0, title: 'H2 - Zentrum für Gegenwartskunst', subtext: ['Augsburg'] }, { id: 'i:A6iu4gLU7bGS5kpAE9pTUf', score: 13.0, title: 'Tomi Ungerer Museum - Internationales Zentrum für Illustration', subtext: ['Strasbourg'] }, { id: 'i:FmHikVmyQJuyynSx7NCsNe', score: 13.0, title: 'Zentrum für Interdisziplinäre Forschnung', subtext: ['ZIF', 'Bielefeld'] }, { id: 'i:R4YjbtHGNsbKzfwyRDF5XJ', score: 13.0, title: 'BrotfabrikGalerie', subtext: ['Zentrum für Kunst & Kultur', 'Berlin, AT'] }, { id: 'i:PYqY6pTrmUgZpnRRhmkgY6', score: 13.0, title: 'Zentrum für Kunst und Kommunikation', subtext: ['Z.K.K.', 'Wien, Austria'] }, { id: 'i:gpptGbzV9f7uYAmxTjyjMg', score: 13.0, title: 'Zentrum für Kunst und Medientechnologie', subtext: ['ZKM', 'Karlsruhe'] }, { id: 'i:Q4AAfWUC6GkHUdRxc7ChxC', score: 13.0, title: 'Open Space - Zentrum für Kunstprojekte', subtext: ['Wien, Austria'] }, { id: 'i:SxX6iZszMJv7M7n54ej6BK', score: 13.0, title: 'Zentrum für Literatur- und Kulturforschung Berlin', subtext: ['Geisteswissenschaftliche Zentren Berlin e.V.', 'Berlin'] }] }, { subset: 'Newest Events', data: [{ id: 'i:qQCn2jtewXhKnLVsFaHgk6', score: 13.0, title: 'Artist-in-Residenz, Zentrum für Kunst und Medien, Institut für Visuelle Medien, Karlsruhe', subtext: [] }, { id: 'i:X44M8fjtLCXfYvhVMo4gRP', score: 13.0, title: 'Ankauf "Interactive Plant Growing", Zentrum für Medientechnologie Karlsruhe, Germany', subtext: [] }] }, { subset: 'Einzelperson', data: [] }, { subset: 'Persons', data: [{ id: 'p:3WU9EBchgTFjE9g5zjUciF', score: 13.0, title: 'Zentrum für politische Schönheit ZPS', subtext: [], description1: { type: 'placedate', value: 'Berlin' } }] }, { subset: 'asdfasdffff', data: [] }, { subset: 'asdfasdf', data: [] }, { subset: 'Nachlass', data: [] }, { subset: 'Werk', data: [] }, { subset: 'Institutions', data: [{ id: 'o:EyZZcmBi6NvBfap2934mah', score: 13.0, title: 'Informationsfolder: Donau-Universität Krems/ Zentrum für Bildwissenschaften. Neuer Lehrgang Bildmanagement, Bildwissenschaft', subtext: [], description2: { text_german: ['Neu startende Universitätslehrgänge Bildmanagement und Bildwissenschaft an der Donau Universität Krems.'], text_english: '' } }] }, { subset: 'Medienbeitrag', data: [] }, { subset: 'Album', data: [{ id: 'o:i5aAZLd7APjjhMML55Bi89', score: 13.0, title: 'Museum Gugging als kommendes Zentrum für Art Brut', subtext: ['Text', '', 'apa - Austria Presse Agentur'], description2: { text_german: '', text_english: '' } }, { id: 'o:fobdG7rNBQ2QDvvaQhJ2mN', score: 13.0, title: 'Neues Zentrum für visuelle Kultur', subtext: ['Text', 'apa - Austria Presse Agentur'], description2: { text_german: '', text_english: '' } }, { id: 'o:CXQMydrwsUKnf8uDS3KduV', score: 13.0, title: 'Neues Zentrum für zeitgenössische Kunstgeschichte', subtext: ['Text', 'Henriette Horny', ''], description2: { text_german: '', text_english: '' } }] }],
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
  methods: {
    async fetchAutocomplete({ searchString, filter, index }) {
      console.log(filter);
      this.autocompleteRequestOngoing = index;
      const response = await this.$api.public.api_v1_autocomplete_create({
        q: searchString,
        filter_name: filter.label === 'Fulltext' ? null : filter.label,
      });
      this.autocompleteResults = JSON.parse(response.data);
      this.autocompleteRequestOngoing = -1;
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
