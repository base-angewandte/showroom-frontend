<template>
  <BaseImageBox
    v-if="data"
    :title="data.alternative ? data.alternative.join(', ') : ''"
    :image-url="mediaImageUrl(data)"
    :icon="imageBoxIcon(data.type)"
    :show-title="false"
    :show-title-on-hover="!['i', 'v'].includes(data.type)"
    :play-icon="['a', 'v'].includes(data.type)"
    :lazyload="true"
    class="base-sr-result-box"
    @clicked="$emit('clicked')">
    <template
      v-if="data.duration"
      slot="footer">
      <span>{{ data.duration.val }}</span>
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
  },
  methods: {
    /**
     * get image url depending on media type
     *
     * @param {object} item - media object
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
    /**
     * get icon depending on media type
     *
     * @param {string} type - media type
     * @returns {string}
     */
    imageBoxIcon(type) {
      let icon = '';
      if (type === 'a') {
        icon = 'audio-object';
      }
      if (type === 'd' || type === 'x') {
        icon = 'file-object';
      }
      return icon;
    },
    /**
     * get first image url value of previews array object
     *
     * @param {array} previews - array with preview objects
     * @returns {string} - image url
     */
    getFirstPreviewsImage(previews) {
      const obj = previews[0];
      return obj[Object.keys(obj)[0]];
    },
  },
};
</script>
