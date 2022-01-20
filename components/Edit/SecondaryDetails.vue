<template>
  <div
    :class="['base-sr-secondary',
             { 'base-sr-row': userCanEdit || edit || dataInt.length }]">
    <BaseEditControl
      v-if="userCanEdit"
      :controls="true"
      title=""
      :edit="edit"
      :edit-button-text="$i18n.t('editView.edit')"
      :cancel-button-text="$i18n.t('editView.ready')"
      :save-button-text="$i18n.t('editView.save')"
      :is-loading="isLoading"
      @activated="activateEdit"
      @canceled="cancel"
      @saved="save" />

    <!-- show data if not empty and not in edit mode -->
    <!-- TODO: add logic to display alternative language if possible
               and add a corresponing html lang="" attribute -->
    <BaseExpandBox
      v-if="dataInt[0][$i18n.locale][0].data && !edit"
      :auto-height="true"
      :show-more-text="$i18n.t('detailView.showMore')"
      :show-less-text="$i18n.t('detailView.showLess')"
      padding="large">
      <BaseTextList
        render-label-as="h2"
        :label-margin-bottom="dataInt.length === 1"
        :data="dataInt[0][$i18n.locale]"
        :cols2="true" />
    </BaseExpandBox>

    <!-- userCanEdit -->
    <BaseBox
      v-if="(userCanEdit && edit)
        || (userCanEdit && !dataInt[0][$i18n.locale][0].data.length)"
      box-ratio="0"
      :box-size="{}"
      :box-hover="false"
      :box-shadow-size="!edit ? 'small' : 'large'"
      class="base-sr-edit-box base-sr--p-large">
      <!-- empty data -->
      <template
        v-if="!edit">
        <h2>{{ $t('detailView.details') }}</h2>

        <div>
          <span>{{ $t('editView.editTextReminder') }}</span>
          <button
            class="base-sr-text-button"
            @click="activateEdit()">
            {{ $t('editView.editNow') }}
          </button>.
        </div>
      </template>

      <!-- edit data -->
      <BaseMultilineTextInput
        v-if="edit"
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

Vue.use(BaseBox);
Vue.use(BaseEditControl);
Vue.use(BaseExpandBox);
Vue.use(BaseMultilineTextInput);
Vue.use(BaseTextList);

export default {
  name: 'SecondaryDetails',
  props: {
    /**
     * specify array to render secondary_details
     */
    data: {
      type: Array,
      default: () => [{ label: 'Details', data: [] }],
    },
    /**
     * set edit mode
     */
    userCanEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dataInt: this.data,
      // toggle edit-mode
      edit: false,
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
  methods: {
    /**
     * read data and activate edit-mode
     */
    activateEdit() {
      this.read();
    },
    /**
     * cancel edit-mode
     */
    cancel() {
      this.edit = false;
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

        if (JSON.parse(response.data).secondary_details) {
          this.editData = JSON.parse(response.data).secondary_details;
        }

        // format textInput
        this.locales.forEach((locale) => {
          this.textInput[this.$t(locale)] = this.editData[0][locale][0].data;
        });

        this.isLoading = false;
        this.edit = true;
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

        // set requestBody
        const requestBody = { secondary_details: this.editData };

        // format requestBody
        this.locales.forEach((locale) => {
          requestBody.secondary_details[0][locale][0].data = this.textInput[this.$t(locale)];
        });

        const response = await this.$api.auth.api_v1_entities_edit_partial_update(
          {
            id: this.$route.params.id,
          },
          {
            requestBody,
          },
        );

        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.saveSuccess'),
          text: this.$t('notify.saveSuccessSubtext'),
          type: 'success',
        });

        // update initial data
        this.dataInt = JSON.parse(response.data).secondary_details;

        this.isLoading = false;
        this.edit = false;
      } catch (e) {
        console.log(e);
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
