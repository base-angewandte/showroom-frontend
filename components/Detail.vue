<template>
  <div class="base-sr-detail">
    <div
      class="base-sr-head">
      <BaseExpandBox
        :show-more-text="$t('show_more')"
        :show-less-text="$t('show_less')"
        padding="large"
        class="base-sr-row base-sr-head__primary"
        @box-height="setFeaturedMediaHeight">
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
      <SecondaryDetails
        v-if="data.secondary_details.length"
        :data="data.secondary_details"
        :user-can-edit="userCanEdit"
        class="base-sr-row base-sr-head__secondary" />

      <!-- featured media -->
      <!-- TODO: add different media formats -->
      <div
        v-if="data.featuredMedia"
        :style="featuredMediaHeight"
        class="base-sr-row base-sr-head__media base-sr-featured-media">
        <BaseImage
          ref="featuredMedia"
          :alt="data.featuredMedia.alternative.join(', ')"
          :lazyload="isMobile()"
          :src="getFirstPreviewsImage(data.featuredMedia.previews)"
          class="base-sr-featured-media__image" />
      </div>
    </div>

    <!-- activity showcase -->
    <Showcase
      v-if="type === 'person' && data.showcase"
      :data="data.showcase"
      :user-can-edit="userCanEdit"
      class="base-sr-row" />

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
          :tile-layer-service="mapTileLayerService"
          :url="mapUrl" />
      </base-expand-box>
    </div>

    <!-- media files -->
    <BaseResultBoxSection
      v-if="data.entries && data.entries.media"
      :entry-list="data.entries.media"
      :expand-text="$t('results.expand')"
      :max-rows="2"
      :max-show-more-rows="1"
      :message-text="$t('results.message.text')"
      :message-subtext="$t('results.message.subtext')"
      :options-button-text="$t('results.optionsButtonText')"
      :select-options-text="$t('results.selectOptionsText')"
      :show-options="false"
      :show-header="true"
      :use-expand-mode="true"
      :use-pagination="false"
      class="base-sr-row">
      <template #header>
        <h2 class="base-sr--ml-small">
          {{ $t('associatedMediaFiles') }}
        </h2>
      </template>

      <template
        v-slot:resultBox="props">
        <BaseImageBox
          :key="props.item.id"
          :title="props.item.alternative.join(', ')"
          :image-url="mediaImageUrl(props.item)"
          :icon="imageBoxIcon(props.item.type)"
          :show-title="false"
          :show-title-on-hover="!['i', 'v'].includes(props.item.type)"
          :play-icon="['a', 'v'].includes(props.item.type)"
          :lazyload="true"
          class="base-sr-result-box"
          @clicked="previewMedia(props.item.id)">
          <template
            v-if="props.item.duration"
            slot="footer">
            <span>{{ props.item.duration }}</span>
          </template>
        </BaseImageBox>
      </template>
    </BaseResultBoxSection>

    <!-- media preview -->
    <template
      v-if="type === 'object' && data.entries.media">
      <BaseMediaCarousel
        :show-preview="showPreview"
        :initial-slide="initialPreviewSlide"
        :items="mediaPreviewData"
        :autoplay-media="true"
        @hide="showPreview = false" />
    </template>

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
  BaseImageBox,
  BaseMapLocations,
  BaseMediaCarousel,
  BaseResultBoxSection,
  BaseTextList,
} from 'base-ui-components';

import Showcase from '~/components/Showcase';
import SecondaryDetails from '~/components/Edit/SecondaryDetails';

import 'base-ui-components/dist/components/BaseButton/BaseButton.css';
import 'base-ui-components/dist/components/BaseCarousel/BaseCarousel.css';
import 'base-ui-components/dist/components/BaseEditControl/BaseEditControl.css';
import 'base-ui-components/dist/components/BaseExpandBox/BaseExpandBox.css';
import 'base-ui-components/dist/components/BaseExpandList/BaseExpandList.css';
import 'base-ui-components/dist/components/BaseImage/BaseImage.css';
import 'base-ui-components/dist/components/BaseImageBox/BaseImageBox.css';
import 'base-ui-components/dist/components/BaseMapLocations/BaseMapLocations.css';
import 'base-ui-components/dist/components/BaseMediaCarousel/BaseMediaCarousel.css';
import 'base-ui-components/dist/components/BaseTextList/BaseTextList.css';
import 'base-ui-components/dist/components/BaseResultBoxSection/BaseResultBoxSection.css';

Vue.use(BaseButton);
Vue.use(BaseCarousel);
Vue.use(BaseEditControl);
Vue.use(BaseExpandBox);
Vue.use(BaseExpandList);
Vue.use(BaseImage);
Vue.use(BaseImageBox);
Vue.use(BaseMapLocations);
Vue.use(BaseMediaCarousel);
Vue.use(BaseTextList);
Vue.use(BaseResultBoxSection);

export default {
  name: 'Detail',
  components: {
    SecondaryDetails,
    Showcase,
  },
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
      // leaflet map
      mapAttribution: process.env.leaflet.attribution,
      mapCopyright: process.env.leaflet.copyright,
      mapTileLayerService: process.env.leaflet.tileLayerService,
      mapUrl: process.env.leaflet.url,
      mapOptions: process.env.leaflet.options,
      // featuredMedia
      featuredMediaHeight: null,
      // mediaPreview
      showPreview: false,
      initialPreviewSlide: null,
    };
  },
  computed: {
    lang() {
      return this.$store.state.appData.locale;
    },
    /**
     * modify data for media preview
     *
     * @returns {object} - modified object for baseMediaCarousel
     */
    mediaPreviewData() {
      return this.data.entries.media.map((item) => {
        let obj;

        // audio
        if (item.type === 'a') {
          obj = {
            mediaUrl: item.mp3,
          };
        }

        // image
        if (item.type === 'i') {
          obj = {
            mediaUrl: this.original,
            previews: item.previews,
          };
        }

        // video
        if (item.type === 'v') {
          obj = {
            mediaPosterUrl: item.poster,
            mediaUrl: item.playlist,
          };
        }

        // document or undefined
        if (item.type === 'd' || item.type === 'x') {
          obj = {
            mediaUrl: item.original,
          };
        }

        return {
          id: item.id,
          title: item.alternative.join(', '),
          ...obj,
        };
      });
    },
  },
  methods: {
    /**
     * get image url depending on media type
     *
     * @param {Object} item - media object
     * @returns {string|null}
     */
    mediaImageUrl(item) {
      /**
       * Todo: size of images should be closer to usage in different viewports.
       * this could be covered by image-resize-service on demand
       * and usage of srcset in BaseImageBox
       */
      // image
      if (item.type === 'i') {
        return this.getFirstPreviewsImage(item.previews);
      }

      // video
      if (item.type === 'v') {
        return item.cover.jpg;
      }

      // document
      if (item.type === 'd') {
        return item.thumbnail;
      }

      return null;
    },
    createHumanReadableDate(val) {
      const date = new Date(val);
      return `${date.toLocaleDateString(this.lang)}, ${date.toLocaleTimeString(this.lang)}`;
    },
    /**
     * get first image url value of previews array object
     *
     * @param {Array} previews - array with preview objects
     * @returns {String} - image url
     */
    getFirstPreviewsImage(previews) {
      const obj = previews[0];
      return obj[Object.keys(obj)[0]];
    },
    /**
     * set height of featuredMedia after primary_box emitted value
     *
     * @param {String} value
     */
    setFeaturedMediaHeight(value) {
      this.featuredMediaHeight = !this.isMobile() ? { height: `${value}px` } : null;
    },
    /**
     * check if viewport <= 640
     *
     * @returns {Boolean}
     */
    isMobile() {
      if (!process.client) {
        return false;
      }

      return window.innerWidth <= 640;
    },
    /* MEDIA PREVIEW */
    /**
     * enable media preview
     *
     * @param {String} id - id of media object
     */
    previewMedia(id) {
      // find array id depending on item.id
      this.initialPreviewSlide = this.mediaPreviewData.findIndex((item) => item.id === id);
      this.showPreview = true;
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
        min-height: 445px;
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

  /* featured media */
  .base-sr-featured-media {
    overflow: hidden;
    max-height: 350px;

    @media screen and (min-width: $breakpoint-small) {
      max-height: inherit;
    }

    &__image {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
</style>
