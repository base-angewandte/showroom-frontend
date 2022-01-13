<template>
  <div
    :class="['base-sr-secondary',
             { 'base-sr-row': userCanEdit || edit || data.length }]">
    <BaseEditControl
      v-if="userCanEdit"
      :controls="true"
      title=""
      :edit="edit"
      :is-loading="isLoading"
      @activated="activateEdit"
      @canceled="cancel"
      @saved="save" />

    <!-- show data if not empty and not in edit mode -->
    <BaseExpandBox
      v-if="data[0] && data[0].data.length && !edit"
      :auto-height="true"
      :show-more-text="$i18n.t('detailView.showMore')"
      :show-less-text="$i18n.t('detailView.showLess')"
      padding="large">
      <BaseTextList
        render-label-as="h2"
        :label-margin-bottom="data.length === 1"
        :data="data"
        :cols2="true" />
    </BaseExpandBox>

    <!-- userCanEdit -->
    <BaseBox
      v-if="(userCanEdit && edit) || (userCanEdit && !data.length)"
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
        :label="data[0] && data[0].label ? data[0].label: $t('detailView.details')"
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
      // toggle edit-mode
      edit: false,
      // async edit-data
      editData: [],
      // loading indicator
      isLoading: false,
      // used for BaseMultilineTextInput
      textInput: {},
      // set time the loader is minimal shown
      loadingDelay: 0,
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
    },
    /**
     * load data with all languages
     */
    async read() {
      this.isLoading = true;
      this.editData = await this.$api.auth.api_v1_entities_edit_retrieve({
        id: this.$route.params.id,
        field: 'secondary_details',
      }).then((response) => JSON.parse(response.data));

      // format textInput
      this.locales.forEach((locale) => {
        this.textInput[this.$t(locale)] = this.editData[0][locale][0].data;
      });

      setTimeout(() => {
        this.isLoading = false;
        this.edit = true;
      }, this.loadingDelay);
    },
    /**
     * save data
     */
    async save() {
      this.isLoading = true;

      // format requestBody
      const requestBody = this.editData;
      // TODO: why is this always the english being fetched?
      this.locales.forEach((locale) => {
        requestBody[0][locale][0].data = this.textInput[this.$t('en')];
      });

      // TODO: this seems like a weird mixture of ES5 .then() and ES6 async/await Promise syntax?
      // is the .then() really necessary?
      // also: error handling / user info necessary?
      await this.$api.auth.api_v1_entities_edit_update(
        {
          id: this.$route.params.id,
          field: 'secondary_details',
        },
        {
          requestBody,
        },
      ).then((response) => {
        if (response.status === 200) {
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.saveSuccess'),
            text: this.$t('notify.saveSuccessSubtext'),
            type: 'success',
          });

          // update initial data
          // TODO: i suppressed the below error message for now but this should probably be
          // handled differently!
          // eslint-disable-next-line vue/no-mutating-props
          this.data[0].data = this.textInput[this.$t(this.$i18n.locale)];

          setTimeout(() => {
            this.isLoading = false;
            this.edit = false;
          }, this.loadingDelay);
        }
      });
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
