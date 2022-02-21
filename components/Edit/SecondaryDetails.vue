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
        <h2>{{ $t('detailView.details') }}</h2>

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
        :label="dataInt[0] && dataInt[0].label ? dataInt[0].label: $t('detailView.details')"
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
  },
  data() {
    return {
      // internal data array object
      dataInt: this.data,
      // toggle edit-mode
      editModeInt: this.editMode,
      // loading indicator
      isLoading: false,
      // used for BaseMultilineTextInput
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
     */
    editData() {
      return this.transformBackendToEditData(this.getEditDataItem({
        type: 'secondary_details',
        id: this.$route.params.id,
      }))[0];
    },
    /**
     * variable actually used for the BaseMultilineTextInput component (v-model)
     */
    editInput: {
      set(val) {
        // assign the value recieved from the input event of the component (or on cancel)
        this.editInputInt = JSON.parse(JSON.stringify(val));
      },
      get() {
        // for get check first if internal variable was set, else use the data fetched
        // from backend else use emtpy object
        return this.editInputInt || this.editData || {};
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
      this.editModeInt = false;
      this.isLoading = false;
      [this.editInput] = this.transformBackendToEditData(this.getEditDataItem({
        type: 'secondary_details',
        id: this.$route.params.id,
      }));
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
        this.dataInt = this.transformBackendToViewData(await this.saveEditData({
          type: 'secondary_details',
          id: this.$route.params.id,
          values,
        }));
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
     * @param {Object[]} newData - the data returned by a update (PATCH) request
     * @property {Object} [language] - language specific data with the lang iso code as key
     * @returns {Object[]} - the data structure necessary for BaseTextList
     */
    transformBackendToViewData(newData) {
      // basically take the correct language from each object in the returned array
      return newData.map((item) => item[this.activeTab]);
    },
    /**
     * function to transform data for edit mode data structure
     * @param {Object[]} newData - the data returned by an edit GET request
     * @property {string} newData[].label
     * @property {string} newData[].data
     * @returns {Object[]} - the data structure necessary for BaseMultiLineTextInput
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
     * @param {Object|Object[]} dataToSend - data as they come from BaseMultilineTextInput
     * @property {string} dataToSend[][language] - an object item of the array with an iso
     *  lang code as key
     * @returns {Object[]} - an object array with 'label' and 'data' attributes
     */
    transformEditToBackendData(dataToSend) {
      return [].concat(dataToSend).map((dataItem) => this.locales
        .reduce((prev, curr) => ({
          ...prev,
          // use language as key (as it was before)
          [curr]: {
            // TODO: this is not exactly language specific...
            label: 'Details',
            // move the original string into the data property
            data: dataItem[curr] || '',
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
