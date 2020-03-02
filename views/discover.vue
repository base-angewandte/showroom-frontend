<template>
  <div class="container">
    <h1 class="hide">
      {{ $i18n.t('frontend') }}
    </h1>
    <client-only>
      <BaseCarousel
        :items="items"
        :swiper-options="{
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 15,
          loop: true,
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
              slidesPerView: 3,
              slidesPerGroup: 3,
            },
          },
        }" />
    </client-only>
  </div>
</template>

<script>
import { BaseCarousel } from 'base-ui-components';

export default {
  components: {
    BaseCarousel,
  },
  data() {
    return {
      items: [
        {
          uid: '1',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Austellung 1',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png',
          href: 'http://base.uni-ak.ac.at',
          previews: [
            {
              '460w': 'https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png',
            },
            {
              '640w': 'https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png',
            },
            {
              '768w': 'https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png',
            },
          ],
        },
        {
          uid: '2',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Austellung 2',
          additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://www.humanesociety.org/sites/default/files/styles/768x326/public/2018/08/kitten-440379.jpg?h=f6a7b1af&itok=vU0J0uZR',
          href: 'http://base.uni-ak.ac.at',
          previews: [
            {
              '460w': 'https://www.humanesociety.org/sites/default/files/styles/768x326/public/2018/08/kitten-440379.jpg?h=f6a7b1af&itok=vU0J0uZR',
            },
            {
              '640w': 'https://www.humanesociety.org/sites/default/files/styles/768x326/public/2018/08/kitten-440379.jpg?h=f6a7b1af&itok=vU0J0uZR',
            },
            {
              '768w': 'https://www.humanesociety.org/sites/default/files/styles/768x326/public/2018/08/kitten-440379.jpg?h=f6a7b1af&itok=vU0J0uZR',
            },
          ],
        },
        {
          uid: '3',
          title: 'Title',
          subtext: 'Subtitle',
          description: 'Austellung 3',
          // additional: '07.05.2020 - 21.05.2020',
          imageUrl: 'https://api.time.com/wp-content/uploads/2015/02/cats.jpg?quality=85&w=1012&h=569&crop=1',
          href: 'http://base.uni-ak.ac.at',
          previews: [
            {
              '460w': 'https://api.time.com/wp-content/uploads/2015/02/cats.jpg?quality=85&w=1012&h=569&crop=1',
            },
            {
              '640w': 'https://api.time.com/wp-content/uploads/2015/02/cats.jpg?quality=85&w=1012&h=569&crop=1',
            },
            {
              '768w': 'https://api.time.com/wp-content/uploads/2015/02/cats.jpg?quality=85&w=1012&h=569&crop=1',
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
};
</script>

<style>
  .container {
  }
</style>
