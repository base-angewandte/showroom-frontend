<template>
  <div
    :class="[{ 'base-sr-edit-active': editModeInt }]">
    <!-- HEADLINE  -->
    <h2 class="hide">
      {{ $t('detailView.activityShowcase') }}
    </h2>

    <!-- EDIT CONTROLS  -->
    <BaseEditControl
      v-if="userCanEdit && !editModeInt"
      :controls="true"
      :edit="editModeInt"
      :disabled="!dataInt.length"
      :title="title"
      :edit-button-text="$i18n.t('editView.edit')"
      class="base-sr--ml-small"
      @activated="enableEdit" />

    <!-- VIEW MODE - CAROUSEL AREA -->
    <div class="base-sr-showcase">
      <!-- PLACEHOLDER IF NO DATA -->
      <div
        v-if="!!placeholderData
          && !dataInt.length
          && !editModeInt
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

      <!-- BASE CAROUSEL -->
      <BaseCarousel
        v-if="(dataInt.length || placeholderData.length) && !editModeInt"
        :items="dataInt && dataInt.length ? dataInt : placeholderData"
        :swiper-options="carouselOptions"
        @initialized="carouselInitialized = true" />
    </div>

    <!-- EDIT MODE - RESULT BOX SECTION AREA -->
    <BaseResultBoxSection
      v-if="editModeInt"
      v-model="editInput"
      :draggable="true"
      :edit-mode.sync="editModeInt"
      :edit-mode-white-background="true"
      :expand-text="$t('resultsView.expand')"
      :is-loading="false"
      :message-text="$t('editView.message.text')"
      :message-subtext="$tc('editView.message.subtext', remainingSelectorEntryNumber, {
        count: remainingSelectorEntryNumber,
        number: remainingSelectorEntryNumber,
      })"
      :options-button-text="$t('editView.optionsButtonText')"
      :options-button-icon="{
        show: 'edit',
        hide: 'check-mark',
      }"
      :selected-list.sync="selectedBoxes"
      :select-options-text="{
        selectAll: $t('editView.selectOptionsText.selectAll'),
        selectNone: $t('editView.selectOptionsText.selectNone'),
        entriesSelected: $t('editView.selectOptionsText.entriesSelected',
                            { type: $tc('activity', selectedBoxes.length) }),
      }"
      :show-options="true"
      :show-action-button-box="true"
      :supportive-text="{
        description: $t('editView.showCaseSupportiveText.description',
                        { number: remainingSelectorEntryNumber }),
        activated: $t('editView.showCaseSupportiveText.activated', { pos: '{pos}' }),
        moved: $t('editView.showCaseSupportiveText.moved', { pos: '{pos}', total: '{total}' }),
      }"
      :header-text="title"
      class="base-sr-showcase-edit"
      @submit-action="actionHandler"
      @entries-changed="actionHandler('sort', $event)">
      <template
        v-if="title"
        #header>
        <h2 class="base-sr--mb-0 base-sr--ml-small">
          {{ `${title} (${editInput.length}/${maxItems})` }}
        </h2>
      </template>

      <template #optionButtons="{ submitAction }">
        <BaseButton
          :text="$t('editView.addActivities')"
          :disabled="remainingSelectorEntryNumber <= 0"
          icon-size="large"
          icon="add-new-object"
          button-style="single"
          @clicked="submitAction('showPopup')" />
        <BaseButton
          :text="$t('editView.delete')"
          :disabled="!selectedBoxes.length"
          icon-size="large"
          icon="waste-bin"
          button-style="single"
          @clicked="submitAction('delete')" />
      </template>
    </BaseResultBoxSection>

    <!-- SELECTOR POP UP -->
    <BasePopUp
      :button-right-text="$t('editView.addActivities')"
      :button-right-disabled="isSaving || !selectorSelectedEntries.length
        || selectorSelectedEntries.length > remainingSelectorEntryNumber"
      :is-loading="isSaving"
      :title="$t('editView.addActivities')"
      :show="showPopUp"
      :fullscreen-on-mobile="true"
      class="base-sr-popup"
      @button-left="cancel"
      @button-right="actionHandler('add')"
      @close="cancel">
      <BaseEntrySelector
        ref="entrySelector"
        :entries="filteredSelectorEntries"
        :entries-total="selectorEntriesNumber"
        :entries-per-page="selectorEntriesPerPage"
        :entries-selectable="true"
        :max-selected-entries="remainingSelectorEntryNumber"
        :height="'calc(60vh - 32px)'"
        :is-loading="isLoading"
        :language="$i18n.locale"
        :options-hidden="true"
        :sort-options="sortOptions"
        :sort-config="{
          label: $t('editView.sortBy'),
          default: {
            label: $t('editView.sortOptions.lastModified'),
            value: 'date_changed',
          },
          valuePropertyName: 'value',
        }"
        :entry-selector-text="{
          selectAll: $t('editView.selectOptionsText.selectAll'),
          selectNone: $t('editView.selectOptionsText.selectNone'),
          entriesSelected: $t('editView.selectOptionsText.entriesSelected',
                              { type: $tc('activity', selectorSelectedEntries.length || 0) }),
          noEntriesTitle: $t(`editView.selectActivitiesPopUp.noEntries${showNoMatchText
            ? 'Match' : 'User'}Title`),
          noEntriesSubtext: $t(`editView.selectActivitiesPopUp.noEntries${showNoMatchText
            ? 'Match' : 'User'}Subtext`),
          search: $t('editView.selectActivitiesPopUp.search'),
          options: $t('editView.selectActivitiesPopUp.options'),
          maxEntriesReached: $t('editView.selectActivitiesPopUp.maxEntries'),
        }"
        class="base-sr-entry-selector"
        @selected-changed="selectorSelectedEntries = $event"
        @fetch-entries="fetchSelectorEntriesRequest" />
    </BasePopUp>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  BaseBoxButton,
  BaseButton,
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

// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions, mapGetters } from 'vuex';
import { userInfo } from '@/mixins/userNotifications';
import { getLangLabel } from '@/utils/common';

Vue.use(BaseButton);
Vue.use(BaseBoxButton);
Vue.use(BaseCarousel);
Vue.use(BaseEditControl);
Vue.use(BaseEntrySelector);
Vue.use(BaseLoader);
Vue.use(BasePopUp);
Vue.use(BaseResultBoxSection);

/**
 * @typedef {Object} CarouselData
 * @property {string} id - an unique id
 * @property {string} title - the title displayed in first line
 * @property {string} href - a reference to redirect to on click
 * @property {string} type - if item is an 'activity' or 'album'
 * @property {string} [imageUrl] - an url to the image shown in the box
 * @property {string} [additional] - additional information visible on an item in the carousel
 * @property {string} [subtext] - the second line text
 */

/**
 * @typedef {Object} ExternalCarouselData
 * @property {string} id - an unique id
 * @property {string} title - the title displayed in first line
 * @property {string} showcase_type - if item is an 'activity' or 'album'
 * @property {Object} [type] - a type of activity if applicable with 'source' and 'label'
 *  in different languages
 * @property {Object[]} [previews] - image urls in different sizes
 * @property {string} [additional] - additional information visible on an item in the carousel
 * @property {string} [subtext] - the second line text
 * @property {string} [image_url] - a separate url for images
 */

/**
 * @typedef {Object} EntrySelectorItem
 * @property {string} id - an unique id
 * @property {string} title - the title displayed in first line
 * @property {string} type - if item is an 'activity' or 'album'
 * @property {string} [subtitle] - alternative text (not displayed in selector)
 * @property {Object} [source_institution] - the repository the entry is coming from
 * @property {number} [score] - a search score
 * @property {string} [image_url] - an url to an image
 * @property {boolean} [disabled] - added internally to remove items already selected
 * @property {string} [description] - the second line in the selector item
 * @property {string[]} [alternative_text] - alternative text to be displayed instead of
 *  image (not relevant here)
 */

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
      // @type {ExternalCarouselData[]}
      default: () => [],
    },
    /**
     * set if user is allowed to edit
     */
    userCanEdit: {
      type: Boolean,
      default: false,
    },
    /**
     * set edit mode from outside
     */
    editMode: {
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
      /**
       * variable for the options needed for swiper of BaseCarousel
       * @type {Object}
       */
      carouselOptions: {},
      /**
       * variable to only show carousel after initialization
       * @type {boolean}
       */
      carouselInitialized: false,
      /**
       * store actual carousel data in internal variable
       * @type {CarouselData[]}
       */
      dataInt: this.formatData(this.data),
      /**
       * keep control of edit mode internally
       * @type {boolean}
       */
      editModeInt: this.editMode,
      /**
       * is component currently loading data
       * @type {boolean}
       */
      isLoading: false,
      /**
       * is component in the process of saving data after edit
       * @type {boolean}
       */
      isSaving: false,
      /**
       * placeholder data in case no data are provided
       * @type {CarouselData[]}
       */
      placeholderData: [],
      /**
       * the if of the items selected in BaseResulBoxSection
       * @type {string[]}
       */
      selectedBoxes: [],
      /**
       * entries visible in BaseEntrySelector
       * @type {EntrySelectorItem[]}
       */
      selectorEntries: [],
      /**
       * total number of selector entries
       * @type {?number}
       */
      selectorEntriesNumber: null,
      /**
       * selector entries per page
       * @type {number}
       */
      selectorEntriesPerPage: 4,
      /**
       * entries selected from BaseEntrySelector
       * @type {Object[]}
       */
      selectorSelectedEntries: [],
      /**
       * control the showing of EntrySelector Pop Up
       * @type {boolean}
       */
      showPopUp: false,
      /**
       * sorting options for Entry Selector
       * @type {Object[]}
       */
      sortOptions: [
        {
          label: this.$t('editView.sortOptions.AZ'),
          value: 'title',
        },
        {
          label: this.$t('editView.sortOptions.ZA'),
          value: '-title',
        },
        {
          label: this.$t('editView.sortOptions.lastModified'),
          value: 'date_changed',
        },
      ],
      /**
       * variable for internal storage of editInput (to use either this or
       * initial store saved editData)
       * @type {?CarouselData[]}
       */
      editInputInt: null,
      /**
       * max number of items a showcase may contain
       * @type {number}
       */
      maxItems: 24,
      /**
       * need this variable to control text displayed in EntrySelector with
       * no results
       */
      showNoMatchText: true,
    };
  },
  computed: {
    ...mapGetters({
      getEditDataItem: 'editData/getEditDataItem',
      getShowcaseData: 'appData/getInitialShowcaseData',
      getInitialData: 'appData/getInitialData',
    }),
    remainingSelectorEntryNumber() {
      return this.maxItems - this.editInput.length;
    },
    /**
     * @returns {ExternalCarouselData[]}
     */
    initialShowcaseData() {
      return this.getShowcaseData(3, true).map((item) => ({
        ...item,
        // modify initial showcase data text so it is less confusing for
        // the user and he gets a hint that this is not visible on his page
        title: this.$t('editView.placeholderTitle'),
        subtext: this.$t('editView.placeholderSubtext'),
        additional: '',
      }));
    },
    /**
     * get the data from showcase GET request in the proper format needed for
     * the BaseCarousel component
     */
    editData() {
      const tempEditData = this.getEditDataItem({
        type: 'showcase',
        id: this.$route.params.id || process.env.institutionId,
      });
      return this.dataInt.map((item) => {
        const editDataItem = tempEditData ? tempEditData
          .find((editItem) => editItem.id === item.id) : {};
        return {
          ...item,
          ...editDataItem,
        };
      });
    },
    /**
     * additional variable to be able to use v-model with BaseCarousel
     */
    editInput: {
      set(val) {
        // assign the value recieved from the input event of the component
        this.editInputInt = val;
      },
      get() {
        // for get check first if internal variable was set, else use the data fetched
        // from backend else use emtpy object
        return this.editInputInt || this.editData || [];
      },
    },
    /**
     * set property disabled to already linked entries or which are not type 'activity'
     * @returns {(*&EntrySelectorItem)[]}
     */
    filteredSelectorEntries() {
      const linkedEntries = this.editInput.map((entry) => entry.id);
      const selectedEntries = this.selectorSelectedEntries.map((selectedEntry) => selectedEntry.id);
      return this.selectorEntries.map((entry) => ({
        ...entry,
        disabled: linkedEntries.includes(entry.id)
          || !['activity', 'album'].includes(entry.type)
          // if maximum number of addable items is reached disable the remaining
          // unselected ones
          || (this.remainingSelectorEntryNumber <= this.selectorSelectedEntries.length
            && !selectedEntries.includes(entry.id)),
      }));
    },
  },
  watch: {
    /**
     * watch dataInt to reset carousel options if necessary
     * @param {CarouselData[]} val
     */
    dataInt(val) {
      // only set options if data are available
      if (val && val.length) {
        this.setCarouselOptions(val);
      }
    },
    /**
     * watch placeholder data to set carousel options if necessary
     * @param {CarouselData[]} val
     */
    placeholderData(val) {
      this.setCarouselOptions(val, true);
    },
    /**
     * keep edit mode in sync with prop provided from outside
     */
    editMode: {
      handler(val) {
        this.editModeInt = val;
      },
      immediate: true,
    },
    /**
     * keep editMode in sync with internal variable and also handle updating of
     * Carousel data here if edit mode is closed
     * @param {boolean} val
     */
    editModeInt(val) {
      if (!val) {
        // update showcase data after editing is done
        this.dataInt = JSON.parse(JSON.stringify(this.editInput));
      }
      if (val !== this.editMode) {
        /**
         * emitted on edit mode toggle<br>
         *   the [.sync modifier](https://vuejs.org/v2/guide/components-custom-events.html#sync-Modifier) may be used on the corresponding prop
         *
         * @event update:edit-mode
         * @param {Object}
         */
        this.$emit('update:edit-mode', { name: 'showcase', editMode: val });
      }
    },
  },
  mounted() {
    // initial setting of carousel options
    this.setCarouselOptions(this.dataInt);
  },
  async created() {
    // if no user data found, try to fetch global showcase or prefill with empty entries
    if (!this.dataInt || !this.dataInt.length) {
      await this.fetchPlaceholderRequest();
    }
  },
  methods: {
    ...mapActions({
      fetchEditData: 'editData/fetchEditData',
      saveEditData: 'editData/saveEditData',
    }),
    /** REQUESTS */

    /**
     * function to recollect showcase data in correct format for editing
     */
    async readEditData() {
      this.isLoading = true;
      try {
        // fetch edit data from store
        await this.fetchEditData({ type: 'showcase', id: this.$route.params.id || process.env.institutionId });
        // if data fetch worked out set edit mode to true
        this.editModeInt = true;
      } catch (e) {
        console.error(e);
        this.informUser({
          action: 'fetch',
          count: 0,
          type: 'showcase',
          notificationType: 'error',
        });
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * request to save data to db
     *
     * @param {CarouselData[]} values - entries
     * @property {string} data[].id - the entry id
     * @property {string} data[].type - the showcase type of the entry (e.g. 'activity')
     * @param {String} action
     * @returns {Promise<void>}
     */
    async updateRequest(values, action) {
      // set pop up button loader icon true
      this.isSaving = true;
      // variable for determining notification message later
      let success = false;
      // get number of items that should be altered
      const count = Math.abs(this.editInput.length - values.length);
      try {
        // update database entry with relevant data
        const responseData = await this.saveEditData({
          type: 'showcase',
          id: this.$route.params.id || process.env.institutionId,
          values,
        });
        // format/update showcase data
        this.editInput = this.formatData(responseData.map((item) => item.details));
        // empty container variables
        this.selectedBoxes = [];
        this.selectorSelectedEntries = [];

        // if no entries left fill with placeHolder data
        if (!this.editInput.length) {
          // check if placeholder data already exist - and if not fetch them
          if (!this.placeholderData.length) {
            await this.fetchPlaceholderRequest();
          }
          this.setCarouselOptions(this.placeholderData, true);
        }

        // set edit mode (= leave edit mode when no activities left to edit)
        this.editModeInt = !!this.editInput.length;
        // mark update as successful
        success = true;
      } catch (e) {
        console.error(e);
      } finally {
        // update states
        this.showPopUp = false;
        this.isSaving = false;
        // add notifications depending on action
        if (!success || action !== 'sort') {
          this.informUser({
            action,
            count,
            type: 'showcase',
            notificationType: success ? 'success' : 'error',
          });
        }
      }
    },
    /**
     * fetch data for the carousel that are shown in the background if nothing
     * was added yet
     */
    async fetchPlaceholderRequest() {
      // clear placeholderData
      this.placeholderData = [];
      try {
        this.isLoading = true;
        // check if initial data was already fetched
        if (!this.getInitialData) {
          // if not - fetch them
          await this.$store.dispatch('appData/fetchInitialData', {});
        }
        // check if initialData has actual showcase data - if yes - use them and format
        // to correct component data structure - if not create mock entries
        this.placeholderData = this.initialShowcaseData && this.initialShowcaseData.length
          ? this.formatData(this.initialShowcaseData)
          : Array.from({ length: 3 }, (index) => ({
            id: `showcase-item-${index}`,
            title: this.$t('editView.placeholderTitle'),
            subtext: this.$t('editView.placeholderSubtext'),
            href: '#',
            type: 'activity',
          }));
        this.isLoading = false;
      } catch (e) {
        console.error(e);
      }
    },
    /**
     * search/fetch entries for add activities popup
     *
     * @param {Object} requestObject
     * @returns {Promise<void>}
     */
    async fetchSelectorEntriesRequest(requestObject) {
      try {
        this.isLoading = true;
        this.selectorEntriesPerPage = this.calcSelectorEntriesPerPage();
        const excludedEntries = this.editInput && this.editInput.length ? this.editInput
          .map((selectedEntry) => selectedEntry.id) : [];

        const queryString = requestObject.query;
        // set the variable that determines which text should be shown if no results
        this.showNoMatchText = !!queryString;
        const requestBodyDefaults = {
          exclude: excludedEntries,
          sort: requestObject.sort.value,
          offset: (requestObject.page - 1) * this.selectorEntriesPerPage,
          limit: this.selectorEntriesPerPage,
        };
        const optionalParams = {};
        if (queryString) {
          this.$set(optionalParams, 'q', queryString);
        } else {
          const id = this.$route.params.id || process.env.institutionId;
          this.$set(optionalParams, 'entity_id', id);
        }

        const response = await this.$api.public.api_v1_showcase_search_create({}, {
          requestBody: {
            ...requestBodyDefaults,
            ...optionalParams,
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

    /** POP UP FUNCTIONALITIES */

    /**
     * cancel and reset popup
     */
    cancel() {
      this.showPopUp = false;
      this.isLoading = false;
      this.isSaving = false;
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

    /** OTHER EDIT FUNCTIONALITIES */

    /**
     * function for actions to be taken either after event from pop up or
     * BaseResultBoxSection
     * @param {string} action - the action in question (e.g. 'delete')
     * @param {CarouselData[]} [entries=[]] - the updated data (only relevant for sorting)
     */
    actionHandler(action, entries = []) {
      // determine if action is 'showPopup' and just open pop up and return
      if (action === 'showPopup') {
        this.showPopUp = true;
        return;
      }
      // else continue with all other actions
      // define variable to temporarily store the new data
      let showcase = [];
      // now do action specific things
      // check if action is 'delete'
      if (action === 'delete') {
        // if yes - filter relevant items from dataInt
        showcase = this.editInput.filter((entry) => !this.selectedBoxes.includes(entry.id));
        // else check if action 'add'
      } else if (action === 'add') {
        // if yes - merge selected entries with existing data in new variable
        showcase = [
          ...this.editInput,
          ...this.selectorSelectedEntries,
        ];
        // else check if action is 'sort'
      } else if (action === 'sort') {
        // and save entries in new order to temp variable
        showcase = entries;
      }

      this.updateRequest(showcase, action);
    },
    /**
     * enable edit mode
     */
    enableEdit() {
      this.readEditData();
    },

    /** OTHER */

    /**
     * set carouselOptions
     *
     * @param {CarouselData[]} data - array with carousel objects
     * @param {boolean} [isPlaceholderData=false] - behaviour of carousel needs
     *  to differ if not real data displayed
     */
    setCarouselOptions(data, isPlaceholderData = false) {
      this.carouselOptions = {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 16,
        threshold: 2,
        autoplay: isPlaceholderData ? false : {
          delay: 7000,
        },
        loop: data && data.length > 3,
        speed: 750,
        keyboard: {
          enabled: true,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
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
     * set missing props if needed
     *
     * @param {ExternalCarouselData[]} data - showcase entries
     * @returns {(ExternalCarouselData&CarouselData)[]}
     */
    formatData(data) {
      return data.map((entry) => ({
        ...entry,
        // adding a description which should be the entry type
        description: entry.type && entry.type.label
          ? getLangLabel(entry.type.label, this.$i18n.locale, true) : '',
        // needed for correct saving to db
        type: entry.showcase_type,
        // needed for the correct link
        href: `/${entry.id}/`,
        // needed for correct image display
        imageUrl: entry.previews && entry.previews.length
          ? Object.values(entry.previews[0])[0] : entry.image_url || '',
      }));
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

.base-sr-edit-active {
  &::v-deep  {
    .base-options {
      .base-button {
        background-color: transparent !important;
      }
    }

    .base-select-options {
      .base-button {
        background-color: transparent !important;
      }
    }
  }
}

.base-sr-showcase-edit {
  &::v-deep  {
    .base-options {
      .base-options__row.base-options__row-right {
        > button:last-child {
          padding-right: 0;
        }
      }
    }
  }
}

.base-sr-entry-selector {
  flex: auto;
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
