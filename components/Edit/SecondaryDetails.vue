<template>
  <div
    :class="['base-sr-secondary',
             { 'base-sr-edit-active': editModeInt },
             { 'base-sr-row': userCanEdit || editModeInt || dataInt.length }]">
    <BaseEditControl
      v-if="userCanEdit"
      :controls="true"
      title=""
      :edit="editModeInt"
      :edit-button-text="$i18n.t('editView.edit')"
      :cancel-button-text="$i18n.t('editView.cancel')"
      :save-button-text="$i18n.t('editView.save')"
      :is-loading="isLoading"
      @activated="enableEdit"
      @canceled="cancel"
      @saved="save" />

    <!-- show data if not empty and not in edit mode -->
    <!-- TODO: add logic to display alternative language if possible
               and add a corresponding html lang="" attribute -->
    <BaseExpandBox
      v-if="!!dataInt
        && !!dataInt.length
        && !!dataInt[0].data
        && !!dataInt[0].data.length
        && !editModeInt"
      :auto-height="true"
      :show-more-text="$i18n.t('detailView.showMore')"
      :show-less-text="$i18n.t('detailView.showLess')"
      padding="large">
      <BaseTextList
        render-label-as="h2"
        :label-margin-bottom="dataInt.length === 1"
        :data="dataInt"
        :cols2="true" />
    </BaseExpandBox>

    <!-- userCanEdit -->
    <BaseBox
      v-if="(userCanEdit && editModeInt)
        || (userCanEdit && !dataInt.length)
        || (userCanEdit && dataInt.length && !dataInt[0].data)"
      box-ratio="0"
      :box-size="{}"
      :box-hover="false"
      :box-shadow-size="!editModeInt ? 'small' : 'large'"
      class="base-sr-edit-box base-sr--p-large">
      <!-- empty data -->
      <template
        v-if="!editModeInt">
        <h2>{{ sectionHeading }}</h2>

        <div>
          <span>{{ $t('editView.editTextReminder') }}</span>
          <button
            class="base-sr-text-button"
            @click="enableEdit()">
            {{ $t('editView.editNow') }}
          </button>.
        </div>
      </template>

      <!-- edit data -->
      <BaseMultilineTextInput
        v-if="editModeInt"
        v-model="editInput"
        :tabs="locales"
        :tab-labels="tabs"
        :active-tab="activeTab"
        :label="sectionHeading"
        :placeholder="$t('editView.editTextReminder')" />
    </BaseBox>
  </div>
</template>

<script>
import Vue from 'vue';

import {
  BaseBox,
  BaseEditControl,
  BaseExpandBox,
  BaseMultilineTextInput,
  BaseTextList,
} from 'base-ui-components';

import 'base-ui-components/dist/components/BaseBox/BaseBox.css';
import 'base-ui-components/dist/components/BaseEditControl/BaseEditControl.css';
import 'base-ui-components/dist/components/BaseExpandBox/BaseExpandBox.css';
import 'base-ui-components/dist/components/BaseMultilineTextInput/BaseMultilineTextInput.css';
import 'base-ui-components/dist/components/BaseTextList/BaseTextList.css';

// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions, mapGetters } from 'vuex';
import { userInfo } from '@/mixins/userNotifications';

/**
 * @typedef {Object} SecondaryDetailsDataItem
 * @property {string} label - a label to be displayed for the category
 * @property {string} data - the values to be displayed in a specific language
 */

Vue.use(BaseBox);
Vue.use(BaseEditControl);
Vue.use(BaseExpandBox);
Vue.use(BaseMultilineTextInput);
Vue.use(BaseTextList);

export default {
  name: 'SecondaryDetails',
  mixins: [userInfo],
  props: {
    /**
     * specify array to render secondary_details
     */
    data: {
      type: Array,
      default: () => [{ label: 'Details', data: [] }],
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
     * set type of entity<br>
     * e.g. 'activity' | 'person'
     */
    entityType: {
      type: String,
      default: 'activity',
      validator: (val) => ['person', 'object'].includes(val),
    },
  },
  data() {
    return {
      /**
       * internal data array object
       * @type {SecondaryDetailsDataItem[]}
       */
      dataInt: this.data,
      /**
       * toggle edit-mode
       * @type {boolean}
       */
      editModeInt: this.editMode,
      /**
       * loading indicator
       * @type {boolean}
       */
      isLoading: false,
      /**
       * used for BaseMultilineTextInput - object with lang iso codes for key
       * @type {?{ [lang: string]: string }}
       */
      editInputInt: null,
    };
  },
  computed: {
    ...mapGetters({
      getEditDataItem: 'editData/getEditDataItem',
    }),
    /**
     * get the data from secondaryDetails GET request in the proper format for
     * BaseMultilineTextInput component
     * @returns {{{ [lang: string]: string }}}
     */
    editData() {
      return this.getEditDataItem({
        type: 'secondary_details',
        id: this.$route.params.id,
      });
    },
    /**
     * variable actually used for the BaseMultilineTextInput component (v-model)
     */
    editInput: {
      set(val) {
        // assign the value recieved from the input event of the component (or on cancel)
        this.editInputInt = JSON.parse(JSON.stringify(val));
      },
      /**
       * @returns {?{ [lang: string]: string }}
       */
      get() {
        // for get check first if internal variable was set, else use the data fetched
        // from backend else use emtpy object
        return this.editInputInt || this.transformBackendToEditData(this.editData)[0] || {};
      },
    },
    /**
     * set active tab depending on active language
     *
     * @returns {string}
     */
    activeTab() {
      return this.$i18n.locale;
    },
    /**
     * get locales from availableLocales
     *
     * @returns {string[]}
     */
    locales() {
      return this.$i18n.availableLocales;
    },
    /**
     * get translated tabs labels from available locales
     *
     * @returns {string[]}
     */
    tabs() {
      return this.locales.map((locale) => this.$t(locale));
    },
    /**
     * the label is needed again later on for updating of data
     */
    sectionHeading() {
      const providedLabel = this.dataInt[0] && this.dataInt[0].label ? this.dataInt[0].label : '';
      return providedLabel || this.entityType === 'person'
        ? this.$t('detailView.cv') : this.$t('detailView.details');
    },
  },
  watch: {
    /**
     * watch prop editMode to sync internal var
     */
    editMode: {
      handler(val) {
        this.editModeInt = val;
      },
      immediate: true,
    },
    /**
     * watch internal var to propagate changes to parent via event
     * @param {boolean} val - is component in edit mode
     */
    editModeInt(val) {
      if (val !== this.editMode) {
        /**
         * emitted on edit mode toggle<br>
         *   the [.sync modifier](https://vuejs.org/v2/guide/components-custom-events.html#sync-Modifier) may be used on the corresponding prop
         *
         * @event update:edit-mode
         * @param {Object}
         */
        this.$emit('update:edit-mode', { name: 'secondary_details', editMode: val });
      }
    },
  },
  methods: {
    ...mapActions({
      fetchEditData: 'editData/fetchEditData',
      saveEditData: 'editData/saveEditData',
    }),
    /**
     * read data and activate edit-mode
     */
    enableEdit() {
      this.read();
    },
    /**
     * cancel edit-mode
     */
    cancel() {
      const originalData = this.getEditDataItem({
        type: 'secondary_details',
        id: this.$route.params.id,
      });
      // reset editInput to original edit data received from backend
      [this.editInput] = this.transformBackendToEditData(originalData);
      // also update view data with latest backend fetched data to ensure consistency
      this.dataInt = this.transformBackendToViewData(originalData);
      this.editModeInt = false;
      this.isLoading = false;
    },
    /**
     * load data with all languages
     */
    async read() {
      this.isLoading = true;
      try {
        // fetch edit data from store
        await this.fetchEditData({ type: 'secondary_details', id: this.$route.params.id });
        // if data fetch worked out set edit mode to true
        this.editModeInt = true;
      } catch (e) {
        console.error(e);
        this.informUser({
          action: 'fetch',
          count: 0,
          type: 'secondary_details',
          notificationType: 'error',
        });
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * save data
     */
    async save() {
      this.isLoading = true;
      // transform data to the necessary format
      const values = this.transformEditToBackendData(this.editInput);
      // variable for determining notification message later
      let success = false;
      try {
        // update database entry with relevant data
        const updatedData = await this.saveEditData({
          type: 'secondary_details',
          id: this.$route.params.id,
          values,
        });
        // update data int
        this.dataInt = this.transformBackendToViewData(updatedData);
        // also update edit data
        [this.editInput] = this.transformBackendToEditData(updatedData);
        // set edit mode false again
        this.editModeInt = false;
        success = true;
      } catch (e) {
        console.error(e);
      } finally {
        // update states
        this.isLoading = false;
        this.informUser({
          action: 'save',
          count: 0,
          type: 'list',
          notificationType: success ? 'success' : 'error',
        });
      }
    },
    /**
     * function to transform data to view mode data structure
     * @param {{ [lang: string]: SecondaryDetailsDataItem }[]} newData - the data returned
     *  by a update (PATCH) request
     * @returns {SecondaryDetailsDataItem[]} - the data structure necessary for BaseTextList
     */
    transformBackendToViewData(newData) {
      // basically take the correct language from each object in the returned array
      return newData.map((item) => item[this.activeTab]);
    },
    /**
     * function to transform data for edit mode data structure
     * @param {{ [lang: string]: SecondaryDetailsDataItem }[]} newData - the data returned by an
     *  edit GET request - iso lang codes as key of the object
     * @returns {{ [lang: string]: string }[]} - the data structure necessary for
     *  BaseMultiLineTextInput
     */
    transformBackendToEditData(newData) {
      return newData.map((newDataItem) => Object.entries(newDataItem)
        .reduce((prev, [key, value]) => ({
          ...prev,
          // the data structure just needs a string instead of 'label', 'data' object
          [key]: value.data,
        }), {}));
    },
    /**
     * function to transform edit mode data to format needed in backend
     * @param {{ [lang: string]: string }[]} dataToSend - data as they come from
     *  BaseMultilineTextInput
     * @returns {{ [lang: string]: SecondaryDetailsDataItem }[]} - an object array with
     *  'label' and 'data' attributes
     */
    transformEditToBackendData(dataToSend) {
      // get original edit data since these are the only ones with have all
      // the necessary labels
      const [originalEditDataWithLabel] = this.editData;
      return [].concat(dataToSend).map((dataItem) => this.locales
        .reduce((prev, curr) => ({
          ...prev,
          // use language as key (as it was before)
          [curr]: {
            label: originalEditDataWithLabel[curr].label,
            // move the original string into the data property
            // also: remove whitespace from data string
            data: dataItem[curr].trim() || '',
          },
        }), {}));
    },
  },
};
</script>

<style lang="scss" scoped>
  .base-sr-edit-box {
    flex-direction: column;

    &::v-deep .base-input {
      margin-top: -9px;

      &.base-multiline-text-input .base-input__label-row .base-input__label {
        font-weight: bold;
        color: $font-color;
      }
    }
  }
</style>
