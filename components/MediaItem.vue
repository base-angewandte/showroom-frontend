<template>
  <BaseImageBox
    v-if="data"
    :title="mediaType"
    :additional="additional"
    :image-url="imageUrl"
    :icon="icon"
    :show-title="false"
    :show-title-on-hover="true"
    :play-icon="showPlayIcon"
    :lazyload="true"
    class="base-sr-result-box"
    @clicked="$emit('clicked')">
    <template
      v-if="data.duration"
      slot="footer">
      <span>{{ formatDuration(data.duration.num) }}</span>
    </template>
  </BaseImageBox>
</template>

<script>
import Vue from 'vue';
import {
  BaseImageBox,
} from 'base-ui-components';
import 'base-ui-components/dist/components/BaseImageBox/BaseImageBox.css';

Vue.use(BaseImageBox);

export default {
  name: 'MediaItem',
  props: {
    /**
     * data object to render item
     */
    data: {
      type: Object,
      default: () => {},
    },
    /**
     * additional information to show on left bottom corner
     * e.g. #1
     */
    additional: {
      type: String,
      default: '',
    },
  },
  computed: {
    /**
     * get image url depending on media type
     *
     * @returns {string|null}
     */
    imageUrl() {
      /**
       * Todo: size of images should be closer to usage in different viewports.
       * this could be covered by image-resize-service on demand
       * and usage of srcset in BaseImageBox
       */

      // image
      if (this.data.type === 'i' && this.data.previews.length) {
        return this.firstPreviewsImage(this.data.previews);
      }

      // video
      if (this.data.type === 'v' && this.data.cover.jpg) {
        return this.data.cover.jpg;
      }

      // document
      if (this.data.type === 'd' && this.data.thumbnail) {
        return this.data.thumbnail;
      }

      return null;
    },
    /**
     * get icon depending on media type
     *
     * @returns {string}
     */
    icon() {
      if (this.data.type === 'a') {
        return 'audio-object';
      }
      if ((!this.imageUrl && this.data.type === 'd')
        || (!this.imageUrl && this.data.type === 'x')) {
        return 'file-object';
      }
      return '';
    },
    /**
     * get media type
     *
     * @returns {string}
     */
    mediaType() {
      return this.$t(`detailView.mediaTypes.${this.data.type}`);
    },
    /**
     * check if play icon is needed
     *
     * @returns {boolean}
     */
    showPlayIcon() {
      // display play icon for audio and video types
      return ['a', 'v'].includes(this.data.type);
    },
  },
  methods: {
    /**
     * get first image url value of previews array object
     *
     * @param {array} previews - array with preview objects
     * @returns {string} - image url
     */
    firstPreviewsImage(previews) {
      const obj = previews[0];
      return obj[Object.keys(obj)[0]];
    },
    /**
     * format duration from seconds to hh:mm:ss
     *
     * @param {number} seconds
     * @returns {string}
     */
    formatDuration(seconds) {
      return new Date(seconds * 1000)
        .toISOString().substr(11, 8);
    },
  },
};
</script>
