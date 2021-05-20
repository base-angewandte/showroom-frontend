<template>
  <div>
    <BaseEditControl
      :controls="userCanEdit"
      :edit="edit"
      :title="$t('activityShowcase')"
      class="base-sr--ml-small"
      @activated="activate"
      @canceled="cancel"
      @saved="save" />

    <BaseCarousel
      v-if="data"
      :items="data"
      :swiper-options="options" />
  </div>
</template>

<script>
import Vue from 'vue';
import {
  BaseCarousel,
  BaseEditControl,
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseCarousel/BaseCarousel.css';
import 'base-ui-components/dist/components/BaseEditControl/BaseEditControl.css';

Vue.use(BaseCarousel);
Vue.use(BaseEditControl);

export default {
  name: 'Showcase',
  props: {
    /**
     * specify array to render showcase
     */
    data: {
      type: Array,
      default: () => [],
    },
    /**
     * set edit mode
     */
    userCanEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      edit: false,
      options: {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 15,
        loop: this.data.showcase && this.data.showcase.length > 3,
        speed: 750,
        simulateTouch: false,
        keyboard: {
          enabled: true,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          1024: {
            slidesPerView: this.data.showcase && this.data.showcase.length < 3 ? 2 : 3,
            slidesPerGroup: this.data.showcase && this.data.showcase.length < 3 ? 2 : 3,
          },
        },
      },
    };
  },
  methods: {
    activate() {
      this.edit = true;
    },
    cancel() {
      this.edit = false;
    },
    save() {
      this.edit = false;
    },
  },
};
</script>
