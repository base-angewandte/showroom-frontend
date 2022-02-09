<template>
  <div class="base-sr-detail">
    <div
      class="base-sr-head">
      <BaseExpandBox
        :auto-height="true"
        :show-more-text="$t('detailView.showMore')"
        :show-less-text="$t('detailView.showLess')"
        :max-collapsed-height="!isMobile()
          ? 445 - 4 * 16 // box height - 2 * $spacing-large
          : 300"
        padding="large"
        class="base-sr-row base-sr-head__primary"
        @box-height="setFeaturedMediaHeight">
        <!-- title -->
        <h1 class="base-sr-h1">
          {{ data.title }}
        </h1>

        <!-- subtext -->
        <BaseTextList
          v-if="data.subtext && data.subtext.length"
          :data="[{ data: data.subtext }]" />

        <!-- expertise / type -->
        <template
          v-if="data.expertise || data.type">
          <div
            class="base-sr-chips">
            <h2
              v-if="data.expertise"
              class="base-sr-chips__label">
              {{ $t('detailView.expertise') }}
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
        <!-- TODO: add print css before -->
        <!--template #footer>
          <BaseButton
            :has-background-color="false"
            :text="$i18n.t('detailView.print')"
            :icon-colored="true"
            icon="print"
            icon-position="top"
            icon-size="large"
            style="padding-left: 0;" />
        </template-->
      </BaseExpandBox>

      <!-- SECONDARY DETAILS -->
      <SecondaryDetails
        v-if="(data.secondary_details
          && data.secondary_details.length
          && data.secondary_details[0].data
          && data.secondary_details[0].data.length)
          || userCanEdit"
        :data="titleCaseLabels(data.secondary_details)"
        :user-can-edit="userCanEdit"
        :edit-mode="editMode.secondary_details"
        class="base-sr-head__secondary"
        @update-data="updateEntityData"
        @update:edit-mode="editModeHandler" />

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
      <div
        v-else-if="isUserProfile"
        :style="featuredMediaHeight"
        class="base-sr-row base-sr-head__media base-sr-featured-media
               base-sr-featured-media__profile-image">
        <!-- TODO: this is just a placeholder - add properly styled user
        add image elements and info! -->
        <base-icon
          name="camera"
          class="base-sr-featured-media__profile-image__icon" />
        <p class="base-sr-featured-media__profile-image__header">
          {{ $t('editView.profileImageHeader') }}
        </p>
        <p class="base-sr-featured-media__profile-image__subtext">
          {{ $t('editView.profileImageLink1', { toTitleCase: false }) }}
          <a
            :href="userPreferencesUrl"
            :title="$t('editView.profileImageLink2')">
            <span
              class="base-sr-featured-media__profile-image__link">
              {{ $t('editView.profileImageLink2') }}</span>
          </a>
          {{ $t('editView.profileImageLink3') }}
        </p>
      </div>
    </div>

    <!-- lists -->
    <List
      v-if="data.list && data.list.length"
      :data="titleCaseLabels(data.list)"
      :edit-mode="editMode.list"
      :entity-type="type"
      :user-can-edit="userCanEdit"
      :class="['base-sr-row',
               { 'base-sr-edit-active': editMode.list }]"
      @update-list="updateEntityData"
      @update:edit-mode="editModeHandler" />

    <!-- activity showcase -->
    <Showcase
      v-if="type === 'person'
        && ((data.showcase && data.showcase.length)
          || userCanEdit)"
      :data="data.showcase"
      :title="$t('detailView.activityShowcase')"
      :user-can-edit="userCanEdit"
      :edit-mode="editMode.showcase"
      class="base-sr-row"
      @update:edit-mode="editModeHandler" />

    <!-- locations -->
    <div
      v-if="data.locations && data.locations.length"
      class="base-sr-row">
      <h2 class="base-sr--ml-small">
        {{ $tc('detailView.location', data.locations.length) }}
      </h2>

      <base-expand-box
        :show-more-text="$t('detailView.showMoreMap')"
        :show-less-text="$t('detailView.showLessMap')">
        <base-map-locations
          attribution-position="topright"
          :attribution="mapAttribution"
          :copyright="mapCopyright"
          :label="$tc('detailView.address', data.locations.length)"
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
      :expand-text="$t('resultsView.expand')"
      :is-loading="isLoading"
      :jump-to-top="true"
      :max-rows="2"
      :current-page-number="1"
      :max-show-more-rows="1"
      :show-options="false"
      :use-expand-mode="true"
      :use-pagination="true"
      class="base-sr-row">
      <template #header>
        <h2 class="base-sr--ml-small">
          {{ $t('detailView.associatedMediaFiles') }}
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
        @hide="showPreview = false"
        @download="downloadFile" />
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
          :expand-text="$t('resultsView.expand')"
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
              {{ $t(`detailView.linked_${index}`) }}
            </h2>
          </template>
          <template #resultBox="{ item }">
            <BaseImageBox
              :key="item.id"
              :title="item.title"
              :subtext="item.subtext"
              :description="item.description"
              :image-url="item.image_url"
              :lazyload="true"
              :link-to="item.id"
              render-element-as="nuxt-link" />
          </template>
        </BaseResultBoxSection>
      </template>
    </template>

    <Search
      v-if="type === 'person' && (userCanEdit
        || userHasShowroomEntries)"
      :header-text="$t('resultsView.headerText.entityResults', { entity: data.title })"
      :result-list.sync="searchResults"
      :applied-filters.sync="appliedFilters"
      :autocomplete-results="autocompleteResults"
      :search-request-ongoing="searchOngoing"
      :autocomplete-loader-index="autocompleteLoaderIndex"
      :page-number="1"
      :no-results-text-initial="$t('detailView.noResultsTextInitial')"
      @autocomplete="fetchAutocomplete"
      @search="search" />

    <!-- owner, dates -->
    <div
      v-if="data.publisher"
      class="base-sr-row base-sr-last-modified">
      <p>
        <template
          v-if="data.publisher.length">
          {{ $t('detailView.publisher') }}: {{ data.publisher[0].name }} |
        </template>
        Showroom Instance: {{ data.source_institution.label }} |
        {{ $t('detailView.publishedDate') }}: {{ createHumanReadableDate(data.date_created) }} |
        {{ $t('detailView.editedDate') }}: {{ createHumanReadableDate(data.date_changed) }}
      </p>
    </div>

    <!-- edit-mode-background -->
    <div
      v-if="editModeIsActive"
      class="base-sr-edit-overlay" />
  </div>
</template>

<script>
import Vue from 'vue';

import {
  BaseButton,
  BaseCarousel,
  BaseEditControl,
  BaseExpandBox,
  BaseLink,
  BaseMapLocations,
  BaseMediaCarousel,
  BaseResultBoxSection,
  BaseTextList,
} from 'base-ui-components';

import Showcase from '~/components/Edit/Showcase';
import SecondaryDetails from '~/components/Edit/SecondaryDetails';
import List from '~/components/Edit/List';
import MediaItem from '~/components/MediaItem';
import { userInfo } from '@/mixins/userNotifications';

import 'base-ui-components/dist/components/BaseButton/BaseButton.css';
import 'base-ui-components/dist/components/BaseCarousel/BaseCarousel.css';
import 'base-ui-components/dist/components/BaseEditControl/BaseEditControl.css';
import 'base-ui-components/dist/components/BaseExpandBox/BaseExpandBox.css';
import 'base-ui-components/dist/components/BaseLink/BaseLink.css';
import 'base-ui-components/dist/components/BaseMapLocations/BaseMapLocations.css';
import 'base-ui-components/dist/components/BaseMediaCarousel/BaseMediaCarousel.css';
import 'base-ui-components/dist/components/BaseTextList/BaseTextList.css';
import 'base-ui-components/dist/components/BaseResultBoxSection/BaseResultBoxSection.css';
import Search from '~/components/Search';

import {
  toTitleString,
  titleCaseLabels,
} from '~/utils/common';

Vue.use(BaseButton);
Vue.use(BaseCarousel);
Vue.use(BaseEditControl);
Vue.use(BaseExpandBox);
Vue.use(BaseLink);
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
    List,
    MediaItem,
  },
  mixins: [userInfo],
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
     * set additional rights for editing own profile
     */
    isUserProfile: {
      type: Boolean,
      default: false,
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
      titleCaseLabels,
      /**
       * edit-mode for different edit sections
       * @type {Object}
       */
      editMode: {
        showcase: false,
        secondary_details: false,
        list: false,
      },
      // search related variables
      /**
       * indicator if search is ongoing
       * @type {boolean}
       */
      searchOngoing: false,
      /**
       * set autocomplete loader for the search row in question
       * @type {number}
       */
      autocompleteLoaderIndex: -1,
      /**
       * get the autocomplete results to the Search component after request
       * @type {Object[]}
       */
      autocompleteResults: [],
      /**
       * also have applied filters available here
       * @type {Object[]}
       */
      appliedFilters: [],
      /**
       * store if user actually has entries that can be displayed in search
       * @type {boolean}
       */
      userHasShowroomEntries: false,
    };
  },
  computed: {
    lang() {
      return this.$store.state.appData.locale;
    },
    /**
     * compute search results from data prop to be able to use
     * .sync modifier from search component
     */
    searchResults: {
      set(val) {
        this.$set(this.data, 'activities', val);
      },
      get() {
        return this.data.activities;
      },
    },
    userPreferencesUrl() {
      return process.env.userPreferencesUrl;
    },
    /**
     * check if some edit-mode is active
     *
     * @returns {boolean}
     */
    editModeIsActive() {
      return Object.values(this.editMode).some((value) => value !== false);
    },
  },
  mounted() {
    // only check once with initial data if user actually has entries that can be
    // displayed in search
    // TODO: remove check for this.searchResults[0].data again? (could break with real data
    // only here because entities_search_create not implemented yet)
    // TODO: disabled due 500 on activities
    // this.userHasShowroomEntries = !!this.searchResults.length
    //   && !!this.searchResults[0].data && !!this.searchResults[0].data.length;
  },
  methods: {
    /**
     * toggle components edit-mode (types: secondary_details, list, showcase)
     *
     * @param {Object} component - { name: 'componentName', editMode: boolean }
     */
    editModeHandler({ name, editMode }) {
      // close all edit sections
      this.editMode = Object.fromEntries(Object.keys(this.editMode).map((key) => [key, false]));
      // set edit-mode for current object
      this.editMode[name] = editMode;
    },
    async search(requestBody) {
      this.searchOngoing = true;
      try {
        const { data } = await this.$api.public.api_v1_entities_search_create({
          id: this.$route.params.id,
        }, {
          requestBody,
        });
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
        } else {
          this.searchResults = [];
        }
      } catch (e) {
        // TODO: error handling
        console.error(e);
        this.searchResults = [];
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
          console.error(e);
          // TODO: error handling
        }
        this.autocompleteLoaderIndex = -1;
      } else {
        this.autocompleteResults = [];
      }
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
            title: item.original.match(/[^\\/]+$/)[0],
          };
        }

        return {
          id: item.id,
          title: !obj.title && item.alternative
            ? item.alternative.join(', ')
            : '',
          additionalInfo: [`${this.$t('detailView.license')}: ${item.license.label}`],
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
    /**
     * download file helper
     *
     * @param {String} url
     * @param {String } fileName
     */
    async downloadFile({ url, fileName }) {
      try {
        // create a hidden download link, start the download
        const link = document.createElement('a');
        link.href = `${url}?download`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        // notify user of error
        this.showPreview = false;
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.errorDownload'),
          text: this.$t('notify.errorDownloadSubtext', { fileName }),
          type: 'error',
        });
      }
    },

    /**
     * EDIT MODE FUNCTIONALITIES
     */

    /**
     * function for updating edited entity view data
     *
     * @param data
     * @property {string} data.prop
     * @property {object} data.requestBody
     * @returns {Promise<void>}
     */
    updateEntityData(data) {
      this.$emit('update-entity', data);
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

    &__profile-image {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      text-align: center;
      color: $font-color-second;
      border: 2px solid $font-color-third;
      padding: $spacing;

      &__icon {
        width: $icon-large;
        margin-bottom: $spacing-small;

        @media screen and (min-width: $breakpoint-small) {
          width: $icon-large * 2;
        }
      }

      &__header {
        font-size: $font-size-large;
        margin-bottom: $spacing-small;
      }

      &__subtext {
        font-size: $font-size-small;
      }

      &__link {
        text-decoration: underline;
        text-decoration-color: $app-color;
      }
    }
  }

  .base-sr-link--mr {
    margin-right: 5px;
  }
</style>
