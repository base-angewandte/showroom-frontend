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
      <div
        class="base-sr-row base-sr-head__secondary">
        secondary_details
      </div>

      <!-- featured media -->
      <div
        class="base-sr-row base-sr-head__media">
        featured_media
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  BaseButton,
  BaseExpandBox,
  BaseTextList,
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseButton/BaseButton.css';
import 'base-ui-components/dist/components/BaseExpandBox/BaseExpandBox.css';
import 'base-ui-components/dist/components/BaseTextList/BaseTextList.css';

Vue.use(BaseButton);
Vue.use(BaseExpandBox);
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
