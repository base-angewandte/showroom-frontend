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
          {{ titleMessage }}
        </h2>
        <!-- eslint-disable vue/multiline-html-element-content-newline -->
        <!-- get rid of prepending white-space -->
        <div
          class="base-sr-box-error__text">{{ $t(`errors.${error.statusCode}.description`) }}
        </div>
        <!-- eslint-enable vue/multiline-html-element-content-newline-->

        <div class="base-sr-box-error__buttons">
          <BaseButton
            :text="$t('errors.homepage')"
            icon="home"
            icon-size="large"
            icon-position="right"
            class="base-sr-box-error__button"
            @clicked="returnToHome" />
          <BaseButton
            v-if="error.statusCode !== 404"
            :text="$t('errors.refresh')"
            icon="refresh"
            icon-size="large"
            icon-position="right"
            class="base-sr-box-error__button"
            @clicked="refreshPage" />
        </div>
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
  computed: {
    titleMessage() {
      // if error message is empty then the whole error object is put into it by
      // default (?) so need to check for that and use status code guided localizations else
      return this.error.message && !this.error.message.includes('statusCode')
        ? this.error.message : this.$t(`errors.${this.error.statusCode}.title`);
    },
  },
  methods: {
    returnToHome() {
      window.location.href = process.env.appPrefix;
    },
    refreshPage() {
      window.location.href = `${process.env.appPrefix}${this.$route.path}`;
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

    &__buttons {
      display: flex;
      flex-direction: row;
      margin-top: $spacing;

      .base-sr-box-error__button {
        margin-right: $spacing;
      }
    }
  }
</style>
