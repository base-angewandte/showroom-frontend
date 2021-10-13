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
          v-if="isInitialView && carouselData && carouselData.length"
          :data="carousel" />
      </transition>
    </client-only>

    <Search
      :result-list.sync="searchResults"
      :applied-filters.sync="appliedFilters"
      :header-text="$t(`results.headerText.${ appliedFilters.length
        ? 'results' : 'latestActivities' }`)"
      class="discover-search"
      @search-active="isInitialView = false" />
  </div>
</template>

<script>
import Showcase from '~/components/Edit/Showcase';
import Search from '~/components/Search';

export default {
  components: {
    Showcase,
    Search,
  },
  async asyncData({ $api, query }) {
    const { page, filters } = query;
    const parsedFilters = filters ? JSON.parse(filters) : [];
    const entryNumber = 6 * 5;
    // get initial search results
    const response = await $api.public.api_v1_search_create({}, {
      requestBody: {
        filters: parsedFilters,
        offset: (page ? (Number(page) - 1) : 0) * entryNumber,
        limit: entryNumber,
      },
    });
    const searchResults = JSON.parse(response.data);
    // TODO: get carousel data (either separate request or together with initial search data)
    return { searchResults, appliedFilters: parsedFilters };
  },
  data() {
    return {
      isInitialView: true,
      searchResults: [],
      appliedFilters: [],
      carouselData: [],
    };
  },
  computed: {
  },
  watch: {
    $route(val) {
      this.expandedSection = { page: Number(val.query.page), category: val.query.category };
    },
  },
  methods: {
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
