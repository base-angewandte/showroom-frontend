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
          v-if="isInitialView"
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
        offset: (page - 1) * entryNumber,
        limit: entryNumber,
      },
    });
    const searchResults = JSON.parse(response.data);
    return { searchResults, appliedFilters: parsedFilters };
  },
  data() {
    return {
      isInitialView: true,
      searchResults: [],
      appliedFilters: [],
      carousel: [
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
