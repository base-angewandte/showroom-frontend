<template>
  <div>
    <!-- edit controls -->
    <BaseEditControl
      v-if="!edit"
      :controls="userCanEdit && !edit"
      :edit="edit"
      :title="title"
      class="base-sr--ml-small"
      @activated="activate" />

    <!-- display showcase -->
    <BaseCarousel
      v-if="data && !edit"
      :items="data"
      :swiper-options="carouselOptions" />

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
      selectedBoxes: [],
    };
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
