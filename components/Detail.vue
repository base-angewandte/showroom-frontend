<template>
  <div class="base-sr-detail">
    <div
      class="base-sr-head">
      <BaseExpandBox
        :show-more-text="$t('show_more')"
        :show-less-text="$t('show_less')"
        padding="large"
        class="base-sr-row base-sr-head__primary">
        <!-- title -->
        <h1 class="base-sr-h1">
          {{ data.title }}
        </h1>

        <!-- subtext -->
        <BaseTextList
          v-if="data.subtext"
          :data="[{ data: data.subtext }]" />

        <!-- expertise / type -->
        <!-- TODO: extract to component -->
        <template
          v-if="data.expertise">
          <h2
            v-if="type === 'person'"
            class="base-sr--mt-small">
            {{ $t('expertise') }}
          </h2>

          <div
            class="base-sr-chips">
            <template
              v-if="type === 'person'">
              <span
                v-for="item in data.expertise"
                :key="item"
                class="base-sr-chips__item">{{ item }}</span>
            </template>
            <template v-else>
              <span class="base-sr-chips__item">{{ data.type }}</span>
            </template>
          </div>
        </template>

        <!-- primary details -->
        <BaseTextList
          render-label-as="h2"
          :data="data.primary_details"
          class="base-sr-head__text-list" />

        <!-- action links: eg. print, sharing, subscribe -->
        <template v-slot:footer>
          <BaseButton
            :has-background-color="false"
            :text="$i18n.t('print')"
            :icon-colored="true"
            icon="print"
            icon-position="top"
            icon-size="large"
            style="padding-left: 0;" />
        </template>
      </BaseExpandBox>

      <!-- secondary details -->
      <BaseExpandBox
        :show-more-text="$i18n.t('show_more')"
        :show-less-text="$i18n.t('show_less')"
        padding="large"
        class="base-sr-row base-sr-head__secondary">
        <BaseTextList
          render-label-as="h2"
          :label-margin-bottom="true"
          :data="data.secondary_details"
          :cols2="true"
          :cols2-breakpoint="1400" />
      </BaseExpandBox>

      <!-- featured media -->
      <!-- TODO: add different media formats -->
      <div
        v-if="data.featuredMedia"
        class="base-sr-row base-sr-head__media">
        <BaseImage
          :alt="data.featuredMedia.alternative.join(', ')"
          :lazyload="true"
          :src="featuredImageSrc('640w')" />
      </div>
    </div>

    <!-- activity showcase -->
    <div
      v-if="type === 'person'"
      class="base-sr-row">
      <BaseEditControl
        :controls="userCanEdit"
        :edit="editShowcase"
        :title="$t('activityShowcase')"
        class="base-sr--ml-small"
        @activated="activateShowcase"
        @canceled="cancelShowcase"
        @saved="saveShowcase" />

      <BaseCarousel
        v-if="data.showcase"
        :items="data.showcase"
        :swiper-options="swiperOptions" />
    </div>

    <!-- lists -->
    <div
      v-if="data.list.length"
      class="base-sr-row">
      <BaseEditControl
        :controls="userCanEdit"
        :edit="editList"
        :subtitle="'(' + data.list.filter(item => !item.hidden).length + ')'"
        :title="type !== 'person' ? $t('lists') : $t('activityLists')"
        class="base-sr--ml-small"
        @activated="activateList"
        @canceled="cancelList"
        @saved="saveList" />

      <BaseExpandList
        ref="baseExpandList"
        :edit="userCanEdit && editList"
        :data="editList ? data.list : data.list.filter(item => !item.hidden)"
        :show-more-text="$t('show_all')"
        :show-less-text="$t('show_less')"
        @saved="saveListEdit">
        <template
          v-slot:content="props">
          <a
            :href="props.data.href ? props.data.href : '#'"
            :title="props.data.value">{{ props.data.value }}</a>
          <template v-if="props.data.attributes">
            - {{ props.data.attributes.join(', ') }}
          </template>
        </template>
      </BaseExpandList>
    </div>

    <!-- locations -->
    <div
      v-if="data.locations"
      class="base-sr-row">
      <h2 class="base-sr--ml-small">
        {{ data.locations.length > 1 ? $t('locations') : $t('location') }}
      </h2>

      <base-expand-box
        :show-more-text="$t('show_more_map')"
        :show-less-text="$t('show_less_map')">
        <base-map-locations
          attribution-position="topright"
          :attribution="mapAttribution"
          :copyright="mapCopyright"
          :label="data.locations.length > 1 ? $t('addresses') : $t('address')"
          :locations="data.locations"
          :options="mapOptions"
          :url="mapUrl" />
      </base-expand-box>
    </div>

    <!-- owner, dates -->
    <div
      v-if="data.publisher"
      class="base-sr-row base-sr-last-modified">
      <p>
        {{ $t('publisher') }}: {{ data.publisher[0].name }} |
        Showroom Instance: {{ data.source_institution.label }} |
        {{ $t('publishedDate') }}: {{ createHumanReadableDate(data.date_created) }} |
        {{ $t('editedDate') }}: {{ createHumanReadableDate(data.date_changed) }}
      </p>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  BaseButton,
  BaseCarousel,
  BaseEditControl,
  BaseExpandBox,
  BaseExpandList,
  BaseImage,
  BaseMapLocations,
  BaseTextList,
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseButton/BaseButton.css';
import 'base-ui-components/dist/components/BaseCarousel/BaseCarousel.css';
import 'base-ui-components/dist/components/BaseEditControl/BaseEditControl.css';
import 'base-ui-components/dist/components/BaseExpandBox/BaseExpandBox.css';
import 'base-ui-components/dist/components/BaseExpandList/BaseExpandList.css';
import 'base-ui-components/dist/components/BaseImage/BaseImage.css';
import 'base-ui-components/dist/components/BaseMapLocations/BaseMapLocations.css';
import 'base-ui-components/dist/components/BaseTextList/BaseTextList.css';

Vue.use(BaseButton);
Vue.use(BaseCarousel);
Vue.use(BaseEditControl);
Vue.use(BaseExpandBox);
Vue.use(BaseExpandList);
Vue.use(BaseImage);
Vue.use(BaseMapLocations);
Vue.use(BaseTextList);
export default {
  name: 'Detail',
  props: {
    /**
     * specify object to render detail
     */
    data: {
      type: Object,
      default: () => {},
    },
    /**
     * set type of detail<br>
     * possible values: 'person' | 'object'
     */
    type: {
      type: String,
      default: '',
      validate(val) {
        return ['person', 'object'].includes(val);
      },
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
      editList: false,
      editShowcase: false,
      // TODO: define map related parameters in .env
      mapAttribution: 'Source: <a href="http://basemap.at">basemap.at</a>',
      mapCopyright: '<a href=http://creativecommons.org/licenses/by-sa/3.0/>CC BY-SA 3.0</a>',
      mapUrl: 'https://{s}.wien.gv.at/basemap/{type}/{style}/{tileMatrixSet}/{z}/{y}/{x}.png',
      mapOptions: {
        style: 'normal',
        subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
        tileMatrixSet: 'google3857',
        type: 'geolandbasemap',
      },
      swiperOptions: {
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
  computed: {
    lang() {
      return this.$store.state.appData.locale;
    },
  },
  methods: {
    createHumanReadableDate(val) {
      const date = new Date(val);
      return `${date.toLocaleDateString(this.lang)}, ${date.toLocaleTimeString(this.lang)}`;
    },
    featuredImageSrc(size) {
      const { previews } = this.data.featuredMedia;
      return previews ? Object.values(previews.find((i) => Object.keys(i)[0] === size))[0] : null;
    },
    /* EDIT LIST */
    activateList() {
      this.editList = true;
    },
    cancelList() {
      this.editList = false;
      this.$refs.baseExpandList.reset();
    },
    saveList() {
      this.editList = false;
      this.$refs.baseExpandList.save();
    },
    saveListEdit(val) {
      console.log('save list', val);
    },
    /* EDIT SHOWCASE */
    activateShowcase() {
      this.editShowcase = true;
    },
    cancelShowcase() {
      this.editShowcase = false;
    },
    saveShowcase() {
      this.editShowcase = false;
    },
  },
};
</script>

<style lang="scss" scoped>
  /* head section with static grid */
  .base-sr-head {
    display: flex;
    flex-wrap: wrap;

    &__primary {
      flex-direction: column;

      @media screen and (min-width: $breakpoint-small) {
        width: calc(66.66% - #{$spacing});
        margin-right: $spacing;
      }
    }

    &__secondary {
      @media screen and (min-width: $breakpoint-small) {
        order: 3;
      }
    }

    &__media {
      @media screen and (min-width: $breakpoint-small) {
        width: 33.33%;
      }
    }

    &__text-list {
      margin-top: $line-height;
    }
  }

  /* chips */
  .base-sr-chips {
    display: flex;

    &__item {
      padding: 0 $spacing-small;
      margin-right: $spacing-small;
      background-color: $background-color;
      text-transform: capitalize;
    }
  }
</style>
