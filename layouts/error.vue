<template>
  <div class="container">
    <BaseBox
      box-ratio="0"
      :box-size="{}"
      :box-hover="false"
      class="base-sr-box-error">
      <BaseIcon
        name="attention"
        class="base-sr-box-error__icon" />
      <div class="base-sr-box-error__info">
        <h2 class="base-sr-box-error__title">
          {{ $t(`errors.${error.statusCode}.title`) }}
        </h2>
        <!-- eslint-disable vue/multiline-html-element-content-newline -->
        <!-- get rid of prepending white-space -->
        <div
          class="base-sr-box-error__text">{{ $t(`errors.${error.statusCode}.description`) }}
        </div>
        <!-- eslint-enable vue/multiline-html-element-content-newline-->

        <BaseButton
          :text="$t('errors.homepage')"
          @clicked="returnToHome" />
      </div>
    </BaseBox>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  BaseBox,
  BaseButton,
  BaseIcon,
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseBox/BaseBox.css';
import 'base-ui-components/dist/components/BaseButton/BaseButton.css';

Vue.use(BaseBox);
Vue.use(BaseButton);
Vue.use(BaseIcon);

export default {
  name: 'Error',
  props: {
    error: {
      type: Object,
      required: true,
    },
  },
  head() {
    return {
      title: `${this.$t(`errors.${this.error.statusCode}.title`)} | ${process.env.appTitle}`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t(`errors.${this.error.statusCode}.description`),
        },
      ],
    };
  },
  methods: {
    returnToHome() {
      window.location.href = process.env.appPrefix;
    },
  },

};
</script>

<style lang="scss" scoped>
  .base-sr-box-error {
    padding: $spacing $spacing $spacing-large;
    align-items: flex-start;

    &__icon {
      min-width: $icon-large;
      width: $icon-large;
      fill: $app-color;

      @media screen and (min-width: $breakpoint-small) {
        width: $icon-large * 2;
      }
    }

    &__info {
      margin-left: $spacing;
    }

    &__text {
      @media screen and (min-width: $breakpoint-small) {
        white-space: pre;
      }
    }
  }
</style>
