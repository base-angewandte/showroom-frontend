<template>
  <div class="base-sr-detail">
    <div
      class="base-sr-head">
      <div class="base-sr-row base-sr-head__primary">
        primary_details
      </div>

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
  }
</style>
