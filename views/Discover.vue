<template>
  <div class="container">
    <h1 class="hide">
      {{ $t('discover.title') }}
    </h1>
    <!-- TODO: replace with showroom Carousel component -->
    <BaseCarousel
      :items="carousel"
      :swiper-options="{
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 15,
        loop: carousel.length > 3,
        speed: 750,
        keyboard: {
          enabled: true,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          1024: {
            slidesPerView: carousel.length < 3 ? 2 : 3,
            slidesPerGroup: carousel.length < 3 ? 2 : 3,
          },
        },
      }" />
    <Search
      :result-list.sync="searchResults"
      :filter-list="filterList"
      class="discover-search" />
  </div>
</template>

<script>
import Search from '~/components/Search';

export default {
  components: { Search },
  async asyncData({ $api }) {
    // get filters
    // TODO: this should move to the search component (or even store!)
    const { data } = await $api.public.api_v1_filter_list();
    const filterList = JSON.parse(data);
    // get initial search results
    // TODO: this should move to the search component
    const response = await $api.public.api_v1_search_read();
    const searchResults = JSON.parse(response.data);
    return { filterList, searchResults };
  },
  data() {
    return {
      searchResults: [],
      filterList: [],
      carousel: [
        {
          uid: '1',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Austellung 1',
          additional: '07.05.2020 - 21.05.2020',
          // eslint-disable-next-line global-require
          imageUrl: 'https://placeimg.com/460/341/arch',
          href: 'http://base.uni-ak.ac.at',
          previews: [
            {
              // eslint-disable-next-line global-require
              '460w': 'https://placeimg.com/460/341/animal',
            },
            {
              // eslint-disable-next-line global-require
              '640w': 'https://placeimg.com/640/480/animal',
            },
            {
              // eslint-disable-next-line global-require
              '768w': 'https://placeimg.com/768/576/animal',
            },
          ],
        },
        {
          uid: '2',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Austellung 2',
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
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Austellung 3',
          // additional: '07.05.2020 - 21.05.2020',
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
          description: 'Austellung 4',
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
          description: 'Austellung',
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
          description: 'Austellung',
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
  methods: {
  },
};
</script>

<style lang="scss" scoped>
.discover-search {
  margin-top: $spacing;
}
</style>
