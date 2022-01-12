<template>
  <div>
    <!-- edit controls -->
    <BaseEditControl
      v-if="userCanEdit && !edit"
      :controls="true"
      :edit="edit"
      :title="title"
      class="base-sr--ml-small"
      @activated="enableEdit" />

    <div class="base-sr-showcase">
      <div
        v-if="!!placeholderData
          && !edit
          && userCanEdit
          && carouselInitialized"
        class="base-sr-showcase__placeholder">
        <BaseBoxButton
          :text="$t('entityView.placeholderCarouselButton')"
          :box-size="{ width: '200px' }"
          :show-plus="true"
          icon="file-object"
          box-style="large"
          box-type="button"
          class="base-sr-showcase__placeholder__button"
          @clicked="(edit = true) + (showAddActivityPopUp = true)" />
      </div>

      <BaseLoader
        v-if="isLoading && !carouselInitialized"
        class="base-sr-showcase__loader" />

      <!-- display showcase -->
      <BaseCarousel
        v-if="(data.length || placeholderData.length) && !edit"
        :items="data && data.length ? data : placeholderData"
        :swiper-options="carouselOptions"
        @initialized="carouselInitialized = true" />
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
          :text="$t('add_activities')"
          icon-size="large"
          icon="add-new-object"
          button-style="single"
          @clicked="scope.submitAction('addActivity')" />
        <BaseButton
          :text="$t('delete')"
          icon-size="large"
          icon="waste-bin"
          button-style="single"
          @clicked="scope.submitAction('delete')" />
      </template>

      <template #resultBox="{ item }">
        <BaseImageBox
          :key="item.id"
          :title="item.title"
          :subtext="item.subtitle"
          :description="item.description"
          :image-url="item.previews[0]['640w']"
          :link-to="item.id"
          :box-text="item.alternative_text"
          render-element-as="nuxt-link" />
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
      <BaseEntrySelector
        ref="entrySelector"
        :entries="selectorEntries"
        :entries-number="selectorEntriesNumber"
        :entries-per-page="selectorEntriesPerPage"
        :entries-selectable="true"
        :height="'calc(50vh - 32px)'"
        :is-loading="isLoading"
        :options-hidden="true"
        :sort-options="sortOptions"
        class="base-sr-entry-selector"
        @fetch-entries="fetchEntries" />
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
  BaseEntrySelector,
  BaseLoader,
  BasePopUp,
  BaseResultBoxSection,
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseButton/BaseButton.css';
import 'base-ui-components/dist/components/BaseBoxButton/BaseBoxButton.css';
import 'base-ui-components/dist/components/BaseCarousel/BaseCarousel.css';
import 'base-ui-components/dist/components/BasePopUp/BasePopUp.css';
import 'base-ui-components/dist/components/BaseEntrySelector/BaseEntrySelector.css';
import 'base-ui-components/dist/components/BaseLoader/BaseLoader.css';
import 'base-ui-components/dist/components/BaseResultBoxSection/BaseResultBoxSection.css';

Vue.use(BaseButton);
Vue.use(BaseBoxButton);
Vue.use(BaseCarousel);
Vue.use(BaseEditControl);
Vue.use(BaseEntrySelector);
Vue.use(BaseLoader);
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
      activeAction: '',
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
      carouselInitialized: false,
      dataInt: this.data,
      edit: false,
      isLoading: false,
      placeholderData: [],
      selectedBoxes: [],
      selectorEntries: [],
      selectorEntriesNumber: null,
      selectorEntriesPerPage: 4,
      showAddActivityPopUp: false,
      sortOptions: [
        {
          label: 'By Type',
          value: 'type_en',
        },
        {
          label: 'A - Z',
          value: 'title',
        },
        {
          label: 'Z - A',
          value: '-title',
        },
        {
          label: 'Last Created',
          value: '-date_created',
        },
        {
          label: 'First Created',
          value: 'date_created',
        },
        {
          label: 'Last Modified',
          value: 'date_modified',
        },
      ],
    };
  },
  async created() {
    /**
     * if no user data found, try to fetch global showcase or prefill with empty entries
     * TODO: if not showcase entries are added,
     *       prefill showcase carousel if possible:
     *       1. user entries or 2. global entries or 3. empty entries
     */
    if (!this.data || !this.data.length) {
      try {
        this.isLoading = true;
        const response = await this.$api.public.api_v1_initial_retrieve({
          id: process.env.institutionId,
        },
        {
          requestBody: {
            limit: 3,
          },
        });
        const { showcase } = JSON.parse(response.data);

        // filter entries with preview image
        const showcaseFiltered = showcase
          .filter((entry) => !!entry.previews.length)
          .slice(0, 3)
          .map((entry) => ({
            ...entry,
            href: entry.id,
          }));

        if (showcaseFiltered.length) {
          this.placeholderData = showcaseFiltered;
          // otherwise prefill with empty entries
        } else {
          for (let i = 1; i <= 3; i += 1) {
            this.placeholderData.push({ title: '', href: '#' });
          }
        }

        this.isLoading = false;
      } catch (e) {
        console.error(e);
      }
    }
  },
  methods: {
    addSelectedEntries() {
      console.log('addSelectedEntries');
      // TODO: add request to add selected entries
    },
    action(value) {
      if (value === 'addActivity') {
        this.showAddActivityPopUp = true;
      }
      console.log(value);
    },
    // Todo: refactor magic values, maybe with props?
    calcSelectorEntriesPerPage() {
      const { entrySelector } = this.$refs;
      let bodyHeight = entrySelector.$refs.body.clientHeight;

      // if pagination element is not present yet (on initial render) deduct height and spacing
      // from height
      if (!entrySelector.$refs.pagination) {
        bodyHeight = bodyHeight - 48 - 16;
      }
      // hardcoded because unfortunately no other possibility found
      const entryHeight = this.isMobile ? 48 : 57;
      const numberOfEntries = Math.floor(bodyHeight / entryHeight);

      return numberOfEntries > 4 ? numberOfEntries : 4;
    },
    entriesChanged(entries) {
      console.log(entries);
    },
    /**
     * enable edit mode
     */
    enableEdit() {
      this.edit = true;
    },
    transformData(data) {
      return data.map((item) => ({
        ...item,
        subtext: typeof item.subtext === 'object'
        && typeof item.subtext[0] === 'string' ? item.subtext.join(', ') : item.subtext,
      }));
    },
    /**
     * search/fetch entries for add activities popup
     */
    async fetchEntries(requestObject) {
      try {
        this.isLoading = true;

        this.selectorEntriesPerPage = this.calcSelectorEntriesPerPage();

        let results = [];
        const filters = [
          {
            label: 'Fulltext',
            id: 'default',
            // TODO: check how to fetch all entries without setting filter_value to ['a']
            filter_values: requestObject.query.length ? requestObject.query.split(' ') : ['a'],
            type: 'activity',
          },
        ];
        const response = await this.$api.public.api_v1_search_create({}, {
          requestBody: {
            filters,
            offset: (requestObject.page - 1) * this.selectorEntriesPerPage,
            limit: this.selectorEntriesPerPage,
          },
        });
        results = [JSON.parse(response.data)];

        if (results) {
          this.selectorEntriesNumber = results[0].total;
          this.selectorEntries = results[0].data;
        }

        this.isLoading = false;
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.base-sr-showcase {
  position: relative;

  .base-sr-showcase__placeholder {
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

    .base-sr-showcase__placeholder__button {
      box-shadow: $max-box-shadow;
      z-index: map-get($zindex, showcase-overlay-button);
    }
  }
}

.base-sr-entry-selector {
  padding: 0 $spacing $spacing;
  background-color: $background-color;
}
</style>
