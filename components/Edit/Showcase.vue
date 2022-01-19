<template>
  <div>
    <!-- edit controls -->
    <BaseEditControl
      v-if="userCanEdit && !edit"
      :controls="true"
      :edit="edit"
      :disabled="!dataInt.length"
      :title="title"
      class="base-sr--ml-small"
      @activated="enableEdit" />

    <div class="base-sr-showcase">
      <div
        v-if="!!placeholderData
          && !dataInt.length
          && !edit
          && userCanEdit
          && carouselInitialized"
        class="base-sr-showcase__placeholder">
        <BaseBoxButton
          :text="$t('editView.addActivities')"
          :box-size="{ width: '200px' }"
          :show-plus="true"
          icon="file-object"
          box-style="large"
          box-type="button"
          class="base-sr-showcase__placeholder__button"
          @clicked="(showPopUp = true)" />
      </div>

      <BaseLoader
        v-if="isLoading && !carouselInitialized"
        class="base-sr-showcase__loader" />

      <!-- display showcase -->
      <BaseCarousel
        v-if="(dataInt.length || placeholderData.length) && !edit"
        :items="dataInt && dataInt.length ? dataInt : placeholderData"
        :swiper-options="carouselOptions"
        @initialized="carouselInitialized = true" />
    </div>

    <!-- edit showcase -->
    <BaseResultBoxSection
      v-if="edit"
      v-model="dataInt"
      :draggable="true"
      :edit-mode.sync="edit"
      :expand-text="$t('resultsView.expand')"
      :is-loading="false"
      :message-text="$t('editView.message.text')"
      :message-subtext="$t('editView.message.subtext')"
      :options-button-text="$t('editView.optionsButtonText')"
      :selected-list.sync="selectedBoxes"
      :select-options-text="{
        ...$t('editView.selectOptionsText'),
        entriesSelected: $t('editView.selectOptionsText.entriesSelected',
                            { type: $tc('activity', selectedBoxes.length) }),
      }"
      :show-options="true"
      :show-action-button-box="true"
      @submit-action="actionHandler"
      @entries-changed="actionHandler('sort', $event)">
      <template
        v-if="title"
        #header>
        <h2 class="base-sr--ml-small">
          {{ title }}
        </h2>
      </template>

      <template #optionButtons="scope">
        <BaseButton
          :text="$t('editView.addActivities')"
          icon-size="large"
          icon="add-new-object"
          button-style="single"
          @clicked="scope.submitAction('showPopup')" />
        <BaseButton
          :text="$t('editView.delete')"
          :disabled="!selectedBoxes.length"
          icon-size="large"
          icon="waste-bin"
          button-style="single"
          @clicked="scope.submitAction('delete')" />
      </template>
    </BaseResultBoxSection>

    <!-- add activity -->
    <BasePopUp
      :button-right-text="$t('editView.addActivities')"
      :button-right-disabled="isSaving || !selectorSelectedEntries.length"
      :is-loading="isSaving"
      :title="$t('editView.addActivities')"
      :show="showPopUp"
      class="base-sr-popup"
      @button-left="cancel"
      @button-right="actionHandler('add')"
      @close="cancel">
      <!-- TODO: fix number of selected boxes as soon as number is available
      in front end -->
      <BaseEntrySelector
        ref="entrySelector"
        :entries="selectorEntries"
        :entries-total="selectorEntriesNumber"
        :entries-per-page="selectorEntriesPerPage"
        :entries-selectable="true"
        :height="'calc(50vh - 32px)'"
        :is-loading="isLoading"
        :language="$i18n.locale"
        :options-hidden="true"
        :sort-options="sortOptions"
        :sort-config="{
          label: $t('editView.sortBy'),
          default: {
            label: {
              en: 'Last Modified',
              de: 'Zuletzt geändert',
            },
            value: 'date_modified',
          },
          valuePropertyName: 'value',
        }"
        :entry-selector-text="{
          ...$t('editView.selectOptionsText'),
          entriesSelected: $t('editView.selectOptionsText.entriesSelected',
                              { type: $tc('activity', selectorSelectedEntries.length || 0) }),
          ...$t('editView.selectActivitiesPopUp')
        }"
        class="base-sr-entry-selector"
        @selected-changed="selectorSelectedEntries = $event"
        @fetch-entries="fetchEntriesRequest" />
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

import { userInfo } from '@/mixins/userNotifications';

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
  mixins: [userInfo],
  props: {
    /**
     * specify data to render showcase
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
      carouselOptions: {},
      carouselInitialized: false,
      dataInt: this.data,
      edit: false,
      isLoading: false,
      isSaving: false,
      placeholderData: [],
      selectedBoxes: [],
      selectorEntries: [],
      selectorEntriesNumber: null,
      selectorEntriesPerPage: 4,
      selectorSelectedEntries: [],
      showPopUp: false,
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
  watch: {
    dataInt(val) {
      this.setCarouselOptions(val);
    },
    placeholderData(val) {
      this.setCarouselOptions(val);
    },
  },
  async created() {
    /**
     * if no user data found, try to fetch global showcase or prefill with empty entries
     * TODO: if not showcase entries are added,
     *       prefill showcase carousel if possible:
     *       1. user entries or 2. global entries or 3. empty entries
     */
    if (!this.dataInt || !this.dataInt.length) {
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
  mounted() {
    this.setCarouselOptions(this.dataInt);
  },
  methods: {
    /**
     * cancel and reset popup
     */
    cancel() {
      this.showPopUp = false;
      this.isLoading = false;
      this.isSaving = false;
    },
    /**
     * set carouselOptions
     *
     * @param {Array} data - array with carousel objects
     */
    setCarouselOptions(data) {
      this.carouselOptions = {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 15,
        loop: data && data.length > 3,
        speed: 750,
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
            slidesPerView: data && data.length < 3 ? 2 : 3,
            slidesPerGroup: data && data.length < 3 ? 2 : 3,
          },
        },
      };
    },
    /**
     * request to save data to db
     *
     * @param {Object[]} data - entries
     * @property {string} data[].id - the entry id
     * @property {string} data[].type - the showcase type of the entry (e.g. 'activity')
     * @param {String} action
     * @returns {Promise<void>}
     */
    async updateRequest(data, action) {
      // get number of items that should be altered
      const count = Math.abs(this.dataInt.length - data.length);
      try {
        this.isSaving = true;
        const response = await this.$api.auth.api_v1_entities_edit_partial_update(
          {
            id: this.$route.params.id,
          },
          {
            requestBody: {
              showcase: data,
            },
          },
        );

        // update states
        this.showPopUp = false;
        this.isSaving = false;

        // update showcase data
        this.dataInt = JSON.parse(response.data).showcase
          // format data for component
          .map((entry) => ({
            ...entry.data,
            href: entry.id,
            imageUrl: entry.data.image_url,
          }));

        // add notifications depending on action
        if (action !== 'sort') {
          this.informUser({
            action,
            count,
            type: 'showcase',
            notificationType: 'success',
          });
        }

        // empty container variables
        this.selectedBoxes = [];
        this.selectorSelectedEntries = [];

        // hide edit mode if all entries have been removed
        this.edit = !!this.dataInt.length;
      } catch (e) {
        console.log(e);
        this.informUser({
          action,
          count,
          type: 'showcase',
          notificationType: 'error',
        });
      }
    },
    async actionHandler(action, entries = []) {
      if (action === 'showPopup') {
        this.showPopUp = true;
        return;
      }

      let showcase = [];

      if (action === 'delete') {
        showcase = this.dataInt.filter((entry) => !this.selectedBoxes.includes(entry.id));
      }

      if (action === 'add') {
        showcase = [
          ...this.dataInt,
          ...this.selectorSelectedEntries,
        ];
      }

      if (action === 'sort') {
        showcase = entries;
      }

      // filter relevant request data
      const requestData = showcase.map((item) => ({
        id: item.id,
        type: item.type,
      }));

      await this.updateRequest(requestData, action);
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
    /**
     * enable edit mode
     */
    enableEdit() {
      this.edit = true;
    },
    /**
     * search/fetch entries for add activities popup
     *
     * @param {Object} requestObject
     * @returns {Promise<void>}
     */
    async fetchEntriesRequest(requestObject) {
      try {
        this.isLoading = true;
        this.selectorEntriesPerPage = this.calcSelectorEntriesPerPage();

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

        const results = JSON.parse(response.data);

        if (results) {
          this.selectorEntriesNumber = results.total;
          this.selectorEntries = results.data;
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

.base-sr-popup {

  &__button {
    flex-basis: 100%;

    &__loader {
      position: relative;
      transform: scale(0.5);
      margin-left: $spacing;
      padding-left: $spacing;
    }
  }

  &__button + &__button {
    margin-left: 0;
    margin-top: $spacing-small;

    @media screen and (min-width: $breakpoint-small) {
      margin-left: $spacing;
      margin-top: 0;
    }
  }
}

</style>
