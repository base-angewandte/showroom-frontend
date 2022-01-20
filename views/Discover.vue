<template>
  <div class="discover__container">
    <h1 class="hide">
      {{ $t('discoverView.title') }}
    </h1>

    <client-only>
      <!-- TODO: improve transition -->
      <transition
        name="fade">
        <Showcase
          v-if="initialDataMode && appliedCarouselData && appliedCarouselData.length"
          :data="appliedCarouselData" />
      </transition>
    </client-only>

    <Search
      :result-list.sync="searchResults"
      :autocomplete-results="autocompleteResults"
      :applied-filters.sync="appliedFilters"
      :search-request-ongoing="searchOngoing"
      :autocomplete-loader-index="autocompleteLoaderIndex"
      :use-collapsed-mode="false"
      :page-number.sync="pageNumber"
      :no-results-text-initial="$t('discoverView.noResultsTextInitial')"
      class="discover-search"
      @autocomplete="fetchAutocomplete"
      @search="search" />
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
  async asyncData({ $api, query }) {
    const { filters, page } = query;
    const parsedFilters = filters ? JSON.parse(filters) : [];
    // assume 2 entries and 5 rows initially
    // TODO: make configurable??
    // this is starting with the smallest number because otherwise higher page
    // numbers are not rendered with small screensize
    const entryNumber = 2 * 5;
    let results = [];
    let showcase = [];
    let initialFilters = [];
    // get initial search results
    if (parsedFilters && parsedFilters.length) {
      try {
        const response = await $api.public.api_v1_search_create({}, {
          requestBody: {
            // TODO: temporary fix for text filters just being strings
            filters: parsedFilters.filter((filter) => hasData(filter.filter_values))
              .map((filter) => ({
                ...filter,
                // filter_values ALWAYS needs to be array
                filter_values: [].concat(filter.type === 'text' ? filter.filter_values
                  .map((value) => value.title || value) : filter.filter_values),
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
        const response = await $api.public.api_v1_initial_retrieve({
          id: process.env.institutionId,
        },
        {
          requestBody: {
            limit: entryNumber,
          },
        });
        const initialData = JSON.parse(response.data);
        showcase = initialData.showcase;
        // TODO: this is just a temporary fix working only with one result category!
        initialFilters = initialData.results[0].filters;
        // if page is not 1 it needs another request with the proper filter!
        if (page > 1 && initialData.results && initialData.results.length) {
          const paginationResponse = await $api.public.api_v1_search_create({}, {
            requestBody: {
              filters: initialFilters,
              offset: (page ? (Number(page) - 1) : 0) * entryNumber,
              limit: entryNumber,
            },
          });
          results = [JSON.parse(paginationResponse.data)];
        } else {
          results = initialData.results;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {
      initialFilters,
      searchResults: results,
      appliedFilters: parsedFilters,
      carouselData: showcase || [],
      pageNumber: page ? Number(page) : 1,
    };
  },
  data() {
    return {
      searchOngoing: false,
      autocompleteLoaderIndex: -1,
      searchResults: [],
      autocompleteResults: [],
      // save the filters from initial request in a variable so they are available
      // when changing pages
      // TODO: this only works with one result category for now!!
      initialFilters: null,
      appliedFilters: [],
      pageNumber: 1,
      // TODO: remove again once API working properly
      defaultCarouselData: [
        {
          id: '1',
          title: 'Whatever Works Best For You',
          subtext: 'On the subject of labor',
          description: 'Exhibition',
          additional: '07.05.2020 - 21.05.2020',
          // eslint-disable-next-line global-require
          imageUrl: 'https://placeimg.com/460/341/arch',
          previews: [
            {
              '460w': 'https://placeimg.com/460/341/animal',
            },
            {
              '640w': 'https://placeimg.com/640/480/animal',
            },
            {
              '768w': 'https://placeimg.com/768/576/animal',
            },
          ],
        },
        {
          id: '2',
          title: 'Throwing Gestures',
          subtext: 'Make The Unknown Visible',
          description: 'Performance',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://placeimg.com/640/480/tech',
          previews: [
            {
              '460w': 'https://placeimg.com/460/341/tech',
            },
            {
              '640w': 'https://placeimg.com/640/480/tech',
            },
            {
              '768w': 'https://placeimg.com/768/576/tech',
            },
          ],
        },
        {
          id: '3',
          title: 'Move From Left to Right and Back and Then Turn Around',
          subtext: 'Moving Frames and Other Variables',
          description: 'Video Installation',
          additional: 'Florian Bettel, Max Arheimer',
          imageUrl: 'https://placeimg.com/640/480/nature',
          previews: [
            {
              '460w': 'https://placeimg.com/460/341/nature',
            },
            {
              '640w': 'https://placeimg.com/640/480/nature',
            },
            {
              '768w': 'https://placeimg.com/768/576/nature',
            },
          ],
        },
        {
          id: '4',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Ausstellung 4',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://placeimg.com/640/480/animal',
          previews: [
            {
              '460w': 'https://placeimg.com/460/341/animal',
            },
            {
              '640w': 'https://placeimg.com/640/480/animal',
            },
            {
              '768w': 'https://placeimg.com/768/576/animal',
            },
          ],
        },
        {
          id: '5',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Ausstellung',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://placeimg.com/640/480/people',
          previews: [
            {
              '460w': 'https://placeimg.com/460/341/people',
            },
            {
              '640w': 'https://placeimg.com/640/480/people',
            },
            {
              '768w': 'https://placeimg.com/768/576/people',
            },
          ],
        },
        {
          id: '6',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Ausstellung',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://placeimg.com/641/480/arch',
          previews: [
            {
              '460w': 'https://placeimg.com/461/341/arch',
            },
            {
              '640w': 'https://placeimg.com/641/480/arch',
            },
            {
              '768w': 'https://placeimg.com/769/576/arch',
            },
          ],
        },
      ],
    };
  },
  computed: {
    // TODO: remove again once API works properly
    appliedCarouselData() {
      const data = this.carouselData && this.carouselData.length
        ? this.carouselData : this.defaultCarouselData;
      return data.map((entry) => ({
        ...entry,
        href: entry.href || entry.id,
      }));
    },
    /**
     * determine if landing page mode should be applied (for search results and
     * carousel display)
     * @returns {boolean}
     */
    initialDataMode() {
      return !this.appliedFilters || !this.appliedFilters.length
        || (this.appliedFilters.length === 1 && !hasData(this.appliedFilters[0].filter_values));
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
  },
  methods: {
    async search(requestBody) {
      // indicate to component that search is onging
      this.searchOngoing = true;
      try {
        // check if there are any filters applied
        if (requestBody.filters && requestBody.filters.length) {
          // if yes apply these filters
          // TODO: dont need to send options to backend --> get rid of this somehow?
          // or do this in BaseAdvancedSearch even
          const { data } = await this.$api.public.api_v1_search_create({}, { requestBody });
          if (data) {
            // TODO: this is a temporary fix to not have duplicates in the search
            // results - REMOVE AGAIN!!
            // assign search results
            const parsedResults = JSON.parse(data);
            const dedupedResults = {
              ...parsedResults,
              data: parsedResults.data
                .reduce((prev, curr) => {
                  if (!prev.map((res) => res.id).includes(curr.id)) {
                    prev.push(curr);
                  }
                  return prev;
                }, []),
            };
            this.searchResults = [{
              ...dedupedResults,
              total: parsedResults.total
                - (parsedResults.data.length - dedupedResults.data.length),
            }];
          }
        } else {
          if (requestBody.offset === 0 || !this.initialFilters) {
            // if not - fetch default data to be displayed for search
            const { data } = await this.$api.public.api_v1_initial_retrieve({
              id: process.env.institutionId,
            });
            const defaultData = JSON.parse(data);
            this.carouselData = defaultData.showcase;
            this.initialFilters = defaultData.results[0].filters;
            if (requestBody.offset === 0) {
              this.searchResults = defaultData.results;
            }
          }
          if (requestBody.offset !== 0) {
            const filterRequest = await this.$api.public.api_v1_search_create({}, {
              requestBody: {
                ...requestBody,
                filters: this.initialFilters,
              },
            });
            this.searchResults = [JSON.parse(filterRequest.data)];
          }
        }
      } catch (e) {
        console.error(e);
        // TODO: error handling
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
              filter_id: filter.label === this.$t('searchView.fulltext') ? 'default' : filter.id,
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
        }
        this.autocompleteLoaderIndex = -1;
      } else {
        this.autocompleteResults = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.discover__container {
  min-height: 100vh;
  .discover-search {
    margin-top: $spacing;
  }
}

.fade-enter-active, .fade-move, .fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
