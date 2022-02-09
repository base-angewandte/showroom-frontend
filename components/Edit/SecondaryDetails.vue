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
        v-model="textInput"
        :tabs="tabs"
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
      // async edit-data
      editData: [
        {
          en: [
            {
              label: 'Details',
              data: '',
            },
          ],
          de: [
            {
              label: 'Details',
              data: '',
            },
          ],
        },
      ],
      // loading indicator
      isLoading: false,
      // used for BaseMultilineTextInput
      textInput: {},
    };
  },
  computed: {
    /**
     * set active tab depending on active language
     *
     * @returns {string}
     */
    activeTab() {
      return this.$t(this.$i18n.locale);
    },
    /**
     * get locales from .env
     *
     * @returns {array}
     */
    locales() {
      return JSON.parse(process.env.locales);
    },
    /**
     * get translated tabs from .env locals
     *
     * @returns {array}
     */
    tabs() {
      return this.locales.map((locale) => this.$t(locale));
    },
  },
  watch: {
    editMode: {
      handler(val) {
        this.editModeInt = val;
      },
      immediate: true,
    },
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
    data(val) {
      this.dataInt = JSON.parse(JSON.stringify(val));
    },
  },
  methods: {
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
      this.textInput = {};
      this.isLoading = false;
    },
    /**
     * load data with all languages
     */
    async read() {
      try {
        this.isLoading = true;

        const response = await this.$api.auth.api_v1_entities_edit_retrieve({
          id: this.$route.params.id,
          secondary_details: true,
        });

        const secondaryDetails = JSON.parse(response.data).secondary_details;

        if (secondaryDetails) {
          this.editData = secondaryDetails;
        }

        // format textInput
        this.locales.forEach((locale) => {
          this.textInput[this.$t(locale)] = this.editData[0][locale].data;
        });

        this.isLoading = false;
        this.editModeInt = true;
      } catch (e) {
        console.log(e);
      }
    },
    /**
     * save data
     */
    async save() {
      try {
        this.isLoading = true;

        // set secondaryDetails array object
        const secondaryDetails = {};
        this.locales.forEach((locale) => {
          secondaryDetails[locale] = {
            label: 'Details',
            data: this.textInput[this.$t(locale)] || '',
          };
        });

        this.$emit('update-data', {
          prop: 'secondary_details',
          data: [secondaryDetails],
        });

        // // set requestBody
        // const requestBody = {
        //   secondary_details: [secondaryDetails],
        // };
        //
        // const response = await this.$api.auth.api_v1_entities_edit_partial_update(
        //   {
        //     id: this.$route.params.id,
        //   },
        //   {
        //     requestBody,
        //   },
        // );
        //
        // // add notification
        // this.informUser({
        //   action: 'save',
        //   type: 'text',
        //   notificationType: 'success',
        // });
        //
        // // update initial data
        // const obj = JSON.parse(response.data).secondary_details;
        // this.dataInt = [obj[0][this.$i18n.locale]];

        // update states
        this.isLoading = false;
        this.editModeInt = false;
      } catch (e) {
        console.log(e);

        this.informUser({
          action: 'save',
          type: 'text',
          notificationType: 'error',
        });

        // update states
        this.isLoading = false;
        this.editModeInt = false;
      }
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
