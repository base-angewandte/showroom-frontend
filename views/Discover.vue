<template>
  <div class="discover__container">
    <h1 class="hide">
      {{ $t('discover.title') }}
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
      :header-text="$t(`results.headerText.${ initialDataMode
        ? 'latestActivities' : 'results' }`)"
      :search-request-onging="searchOngoing"
      :autocomplete-loader-index="autocompleteLoaderIndex"
      :use-collapsed-mode="initialDataMode"
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

export default {
  components: {
    Showcase,
    Search,
  },
  async asyncData({ $api, query }) {
    const { filters, page } = query;
    const parsedFilters = filters ? JSON.parse(filters) : [];
    const entryNumber = 6 * 5;
    let results = [];
    let showcase = [];
    // get initial search results
    if (parsedFilters.length) {
      const response = await $api.public.api_v1_search_create({}, {
        requestBody: {
          // TODO: temporary fix for text filters just being strings
          filters: parsedFilters.map((filter) => ({
            ...filter,
            filter_values: filter.type === 'text' ? filter.filter_values
              .map((value) => value.title) : filter.filter_values,
          })),
          offset: (page ? (Number(page) - 1) : 0) * entryNumber,
          limit: entryNumber,
        },
      });
      results = [JSON.parse(response.data)];
    } else {
      // TODO: add pagination and offset!
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
      results = initialData.results;
    }
    return { searchResults: results, appliedFilters: parsedFilters, carouselData: showcase || [] };
  },
  data() {
    return {
      searchOngoing: false,
      autocompleteLoaderIndex: -1,
      searchResults: [],
      autocompleteResults: [],
      appliedFilters: [],
      // TODO: remove again once API working properly
      defaultCarouselData: [
        {
          uid: '1',
          title: 'Whatever Works Best For You',
          subtext: 'On the subject of labor',
          description: 'Exhibition',
          additional: '07.05.2020 - 21.05.2020',
          // eslint-disable-next-line global-require
          imageUrl: 'https://placeimg.com/460/341/arch',
          href: 'www.angewandte.at',
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
          uid: '2',
          title: 'Throwing Gestures',
          subtext: 'Make The Unknown Visible',
          description: 'Performance',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://placeimg.com/640/480/tech',
          href: 'http://base.uni-ak.ac.at',
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
          uid: '3',
          title: 'Move From Left to Right and Back and Then Turn Around',
          subtext: 'Moving Frames and Other Variables',
          description: 'Video Installation',
          additional: 'Florian Bettel, Max Arheimer',
          imageUrl: 'https://placeimg.com/640/480/nature',
          href: 'http://base.uni-ak.ac.at',
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
          uid: '4',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Ausstellung 4',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://placeimg.com/640/480/animal',
          href: 'http://base.uni-ak.ac.at',
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
          uid: '5',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Ausstellung',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://placeimg.com/640/480/people',
          href: 'http://base.uni-ak.ac.at',
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
          uid: '6',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Ausstellung',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://placeimg.com/641/480/arch',
          href: 'http://base.uni-ak.ac.at',
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
      return this.carouselData && this.carouselData.length ? this.carouselData
        : this.defaultCarouselData;
    },
    /**
     * determine if landing page mode should be applied (for search results and
     * carousel display)
     * @returns {boolean}
     */
    initialDataMode() {
      return !this.appliedFilters || !this.appliedFilters.length;
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
  watch: {
    $route(val) {
      this.expandedSection = { page: Number(val.query.page), category: val.query.category };
    },
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
            // assign search results
            this.searchResults = [JSON.parse(data)];
          }
        } else {
          // if not - fetch default data to be displayed for search
          // TODO: add pagination and offset!
          const { data } = await this.$api.public.api_v1_initial_retrieve({
            id: process.env.institutionId,
          });
          const defaultData = JSON.parse(data);
          this.searchResults = defaultData.results;
          this.carouselData = defaultData.showcase;
        }
      } catch (e) {
        console.error(e);
        // TODO: error handling
      }
      this.searchOngoing = false;
    },
    async fetchAutocomplete({ searchString, filter, index }) {
      if (searchString) {
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
