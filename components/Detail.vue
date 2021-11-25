<template>
  <div class="base-sr-detail">
    <div
      class="base-sr-head">
      <BaseExpandBox
        :auto-height="true"
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
        <template
          v-if="data.expertise || data.type">
          <div
            class="base-sr-chips">
            <h2
              v-if="data.expertise"
              class="base-sr-chips__label">
              {{ $t('expertise') }}
            </h2>

            <template v-if="type === 'person'">
              <span
                v-for="item in data.expertise"
                :key="item"
                class="base-sr-chips__item">{{ item }}</span>
            </template>
            <!-- otherwise we assume it's an activity and display the type -->
            <template v-else>
              <span
                class="base-sr-chips__item base-sr-chips__item--single">
                {{ toTitleString(data.type.label[$i18n.locale], $i18n.locale) }}
              </span>
            </template>
          </div>
        </template>

        <!-- primary details -->
        <BaseTextList
          v-if="data.primary_details && data.primary_details.length"
          render-label-as="h2"
          :data="titleCaseLabels(data.primary_details)"
          class="base-sr-head__text-list" />

        <!-- action links: eg. print, sharing, subscribe -->
        <template #footer>
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
        :data="titleCaseLabels(data.secondary_details)"
        :user-can-edit="userCanEdit"
        class="base-sr-head__secondary" />

      <!-- featured media -->
      <div
        v-if="data.featured_media"
        :style="featuredMediaHeight"
        class="base-sr-row base-sr-head__media base-sr-featured-media">
        <MediaItem
          ref="featuredMedia"
          :data="data.featured_media"
          @clicked="previewMedia([data.featured_media], data.featured_media.id)" />
      </div>
    </div>

    <!-- lists -->
    <div
      v-if="data.list && data.list.length"
      class="base-sr-row">
      <BaseEditControl
        v-if="userCanEdit"
        :controls="true"
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
        :data="editList
          ? titleCaseLabels(data.list)
          : titleCaseLabels(data.list).filter(item => !item.hidden)"
        :show-more-text="$t('show_all')"
        :show-less-text="$t('show_less')"
        @saved="saveListEdit">
        <template #content="props">
          <a
            :href="props.data.href ? props.data.href : '#'"
            :title="props.data.value">{{ props.data.value }}</a>
          <template v-if="props.data.attributes">
            - {{ props.data.attributes.join(', ') }}
          </template>
        </template>
      </BaseExpandList>
    </div>

    <!-- activity showcase -->
    <Showcase
      v-if="type === 'person' && data.showcase"
      :data="data.showcase"
      :title="$t('activityShowcase')"
      :user-can-edit="userCanEdit"
      class="base-sr-row" />

    <!-- locations -->
    <div
      v-if="data.locations && data.locations.length"
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
      v-if="data.entries && data.entries.media && data.entries.media.length"
      :entry-list="data.entries.media"
      :expand-text="$t('results.expand')"
      :is-loading="isLoading"
      :jump-to-top="true"
      :max-rows="2"
      :current-page-number="1"
      :max-show-more-rows="1"
      :message-text="$t('results.message.text')"
      :message-subtext="$t('results.message.subtext')"
      :options-button-text="$t('results.optionsButtonText')"
      :select-options-text="$t('results.selectOptionsText')"
      :show-options="false"
      :use-expand-mode="true"
      :use-pagination="true"
      class="base-sr-row">
      <template #header>
        <h2 class="base-sr--ml-small">
          {{ $t('associatedMediaFiles') }}
        </h2>
      </template>

      <template #resultBox="props">
        <MediaItem
          :key="props.item.id"
          :data="props.item"
          @clicked="previewMedia(data.entries.media, props.item.id)" />
      </template>
    </BaseResultBoxSection>

    <!-- media preview -->
    <template
      v-if="type === 'object'">
      <BaseMediaCarousel
        :show-preview="showPreview"
        :initial-slide="initialPreviewSlide"
        :items="mediaPreviewData"
        :autoplay-media="true"
        :allow-download="false"
        @hide="showPreview = false" />
    </template>

    <!-- linked / parent -->
    <template
      v-if="data.entries && data.entries.linked">
      <template
        v-for="(section, index) in data.entries.linked">
        <BaseResultBoxSection
          v-if="section.length"
          :key="index"
          :entry-list="section"
          :show-options="false"
          :expand-text="$t('results.expand')"
          :total="section.length"
          :max-show-more-rows="1"
          :current-page-number="1"
          :use-pagination="true"
          :use-expand-mode="true"
          :max-rows="2"
          :use-pagination-link-element="'nuxt-link'"
          class="base-sr-row">
          <template #header>
            <h2 class="base-sr--ml-small">
              {{ $t(`linked_${index}`) }}
            </h2>
          </template>
          <template #resultBox="{ item }">
            <BaseImageBox
              :key="item.id"
              :title="item.title"
              :subtext="item.subtext"
              :description="item.description"
              :image-url="item.imageUrl"
              :lazyload="true"
              :link-to="item.id"
              render-element-as="nuxt-link" />
          </template>
        </BaseResultBoxSection>
      </template>
    </template>

    <Search
      v-if="type === 'person'"
      :header-text="$t('results.headerText.entityResults', { entity: data.title })"
      :result-list="data.activities" />

    <!-- owner, dates -->
    <div
      v-if="data.publisher"
      class="base-sr-row base-sr-last-modified">
      <p>
        <template
          v-if="data.publisher.length">
          {{ $t('publisher') }}: {{ data.publisher[0].name }} |
        </template>
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
  BaseMapLocations,
  BaseMediaCarousel,
  BaseResultBoxSection,
  BaseTextList,
} from 'base-ui-components';

import Showcase from '~/components/Edit/Showcase';
import SecondaryDetails from '~/components/Edit/SecondaryDetails';
import MediaItem from '~/components/MediaItem';

import 'base-ui-components/dist/components/BaseButton/BaseButton.css';
import 'base-ui-components/dist/components/BaseCarousel/BaseCarousel.css';
import 'base-ui-components/dist/components/BaseEditControl/BaseEditControl.css';
import 'base-ui-components/dist/components/BaseExpandBox/BaseExpandBox.css';
import 'base-ui-components/dist/components/BaseExpandList/BaseExpandList.css';
import 'base-ui-components/dist/components/BaseMapLocations/BaseMapLocations.css';
import 'base-ui-components/dist/components/BaseMediaCarousel/BaseMediaCarousel.css';
import 'base-ui-components/dist/components/BaseTextList/BaseTextList.css';
import 'base-ui-components/dist/components/BaseResultBoxSection/BaseResultBoxSection.css';
import Search from '~/components/Search';

import {
  toTitleString,
  checkForLabel,
} from '~/utils/common';

Vue.use(BaseButton);
Vue.use(BaseCarousel);
Vue.use(BaseEditControl);
Vue.use(BaseExpandBox);
Vue.use(BaseExpandList);
Vue.use(BaseMapLocations);
Vue.use(BaseMediaCarousel);
Vue.use(BaseTextList);
Vue.use(BaseResultBoxSection);

export default {
  name: 'Detail',
  components: {
    Search,
    SecondaryDetails,
    Showcase,
    MediaItem,
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
     * flag to set if loader should be shown
     */
    isLoading: {
      type: Boolean,
      default: false,
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
      mediaPreviewData: null,
      toTitleString,
    };
  },
  computed: {
    lang() {
      return this.$store.state.appData.locale;
    },
  },
  methods: {
    /**
     * title case labels
     *
     * @param {Array} data
     * @returns {Array}
     */
    titleCaseLabels(data) {
      return Object.values(
        Object.entries(data)
          .reduce((prev, [key, value]) => {
            const newVal = checkForLabel(value);
            return { ...prev, ...{ [key]: newVal } };
          }, {}),
      );
    },
    /**
     * modify data for media preview
     *
     * @returns {object} - modified object for baseMediaCarousel
     */
    modifyPreviewData(data) {
      return data.map((item) => {
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
          title: item.alternative ? item.alternative.join(', ') : '',
          ...obj,
        };
      });
    },
    createHumanReadableDate(val) {
      const date = new Date(val);
      return `${date.toLocaleDateString(this.lang)}, ${date.toLocaleTimeString(this.lang)}`;
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
     * @param {Array} data - array of media entries
     * @param {String} id - id of media object
     */
    previewMedia(data, id) {
      this.mediaPreviewData = this.modifyPreviewData(data);
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
  /* TODO: currently displayed in one line if baseExpandBox is not expanded */
  /* Expertise is very prominent for now - maybe order as last element in primary_details */
  .base-sr-chips {
    position: relative;
    margin-top: $line-height;

    &__label {
      margin-bottom: $spacing-small;
    }

    &__item {
      padding: 0 $spacing-small;
      margin-right: $spacing-small;
      background-color: $background-color;
      text-transform: capitalize;
      white-space: nowrap;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      width: 50px;
      background: linear-gradient(to right, rgba(255, 255, 255, 0) , rgba(255, 255, 255, 1));
    }
  }

  /* chips if baseBoxExpand is expanded */
  .base-sr-head__primary {
    &.base-expand-box-open {
      .base-sr-chips {
        &::after {
          display: none;
        }

        .base-sr-chips__label {
          margin: 0;
        }

        .base-sr-chips__item:not(.base-sr-chips__item--single) {
          display: inline-block;
          margin-top: $spacing-small;
        }
      }
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
