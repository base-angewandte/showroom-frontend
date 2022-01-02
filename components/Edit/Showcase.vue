<template>
  <div>
    <!-- edit controls -->
    <BaseEditControl
      v-if="userCanEdit && !edit"
      :controls="true"
      :edit="edit"
      :title="title"
      class="base-sr--ml-small"
      @activated="activate" />

    <div class="base-sr--showcase">
      <div
        v-if="!!placeholderData && !edit"
        class="base-sr--showcase-placeholder">
        <BaseBoxButton
          :text="$t('entityView.placeholderCarouselButton')"
          :box-size="{ width: '200px' }"
          :show-plus="true"
          icon="file-object"
          box-style="large"
          box-type="button"
          class="base-sr--showcase-placeholder__button" />
      </div>
      <!-- display showcase -->
      <BaseCarousel
        v-if="(data || placeholderData) && !edit"
        :items="data && data.length ? data : placeholderData"
        :swiper-options="carouselOptions" />
    </div>

    <!-- edit showcase -->
    <BaseResultBoxSection
      v-if="edit"
      v-model="dataInt"
      :draggable="true"
      :edit-mode.sync="edit"
      :expand-text="$t('results.expand')"
      :is-loading="false"
      :message-text="$t('results.message.text')"
      :message-subtext="$t('results.message.subtext')"
      :options-button-text="$t('results.optionsButtonText')"
      :selected-list="selectedBoxes"
      :select-options-text="$t('results.selectOptionsText')"
      :show-options="true"
      :show-action-button-box="true"
      @submit-action="action"
      @entries-changed="entriesChanged">
      <template
        v-if="title"
        #header>
        <h2 class="base-sr--ml-small">
          {{ title }}
        </h2>
      </template>
      <template #optionButtons="scope">
        <BaseButton
          :text="$t('add_activity')"
          icon-size="large"
          icon="sheet-empty"
          button-style="single"
          @clicked="scope.submitAction('addActivity')" />
        <BaseButton
          :text="'delete'"
          icon-size="large"
          icon="waste-bin"
          button-style="single"
          @clicked="scope.submitAction('delete')" />
      </template>

      <template #actionButtons>
        <BaseBoxButton
          :text="$t('add_activity')"
          :box-size="{ width: 'auto' }"
          :show-plus="true"
          icon="sheet-empty"
          box-style="large"
          box-type="button"
          class="base-result-box-section__box" />
      </template>
    </BaseResultBoxSection>

    <!-- add activity -->
    <BasePopUp
      :button-right-text="$t('selectEntries')"
      :show="showAddActivityPopUp"
      :title="$t('add_activities')"
      @button-left="showAddActivityPopUp = false"
      @button-right="addSelectedEntries"
      @close="showAddActivityPopUp = false">
      <!-- Todo: implement entry selection -->
      select entries
    </BasePopUp>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  BaseButton,
  BaseBoxButton,
  BaseCarousel,
  BaseEditControl,
  BasePopUp,
  BaseResultBoxSection,
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseButton/BaseButton.css';
import 'base-ui-components/dist/components/BaseBoxButton/BaseBoxButton.css';
import 'base-ui-components/dist/components/BaseCarousel/BaseCarousel.css';
import 'base-ui-components/dist/components/BasePopUp/BasePopUp.css';
import 'base-ui-components/dist/components/BaseResultBoxSection/BaseResultBoxSection.css';

Vue.use(BaseButton);
Vue.use(BaseBoxButton);
Vue.use(BaseCarousel);
Vue.use(BaseEditControl);
Vue.use(BasePopUp);
Vue.use(BaseResultBoxSection);

export default {
  name: 'Showcase',
  components: {},
  props: {
    /**
     * specify array to render showcase
     */
    data: {
      type: Array,
      default: () => [],
    },
    /**
     * set edit mode
     */
    userCanEdit: {
      type: Boolean,
      default: false,
    },
    /**
     * specify title for headline before the carousel
     */
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      dataInt: this.data,
      activeAction: '',
      edit: false,
      showAddActivityPopUp: false,
      carouselOptions: {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 15,
        loop: this.data.showcase && this.data.showcase.length > 3,
        speed: 750,
        // simulateTouch: false,
        keyboard: {
          enabled: true,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          640: {
            slidesPerView: 2,
            slidesPerGroup: 2,
          },
          1024: {
            slidesPerView: this.data.showcase && this.data.showcase.length < 3 ? 2 : 3,
            slidesPerGroup: this.data.showcase && this.data.showcase.length < 3 ? 2 : 3,
          },
        },
      },
      placeholderData: [],
      selectedBoxes: [],
    };
  },
  async created() {
    // TODO: this is not working!!
    // (carousel view remains empty even though data are there)
    // TODO 2: not even sure if this is a good idea but where to get appropriate data from?
    // or should it look differently??
    if (!this.data || !this.data.length) {
      try {
        const response = await this.$api.public.api_v1_initial_retrieve({
          id: process.env.institutionId,
        },
        {
          requestBody: {
            limit: 3,
          },
        });
        const { showcase } = JSON.parse(response.data);
        if (showcase && showcase[0]
          && showcase[0].data && showcase[0].data.length) {
          this.placeholderData = showcase[0].data
            .filter((entry) => !!entry.image_url)
            .slice(0, 3)
            .map((entry) => ({
              ...entry,
              href: entry.id,
            }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
  methods: {
    addSelectedEntries() {
      console.log('addSelectedEntries');
    },
    action(value) {
      if (value === 'addActivity') {
        this.showAddActivityPopUp = true;
      }
      console.log(value);
    },
    entriesChanged(entries) {
      console.log(entries);
    },
    activate() {
      this.edit = true;
    },
    transformData(data) {
      return data.map((item) => ({
        ...item,
        subtext: typeof item.subtext === 'object'
        && typeof item.subtext[0] === 'string' ? item.subtext.join(', ') : item.subtext,
      }));
    },
  },
};
</script>

<style lang="scss" scoped>
.base-sr--showcase {
  position: relative;

  .base-sr--showcase-placeholder {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: $loading-background;
    z-index: map-get($zindex, showcase-overlay);
    display: flex;
    justify-content: center;
    align-items: center;

    .base-sr--showcase-placeholder__button {
      box-shadow: $max-box-shadow;
      z-index: map-get($zindex, showcase-overlay-button);
    }
  }
}
</style>
