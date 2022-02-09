<template>
  <div>
    <BaseEditControl
      v-if="userCanEdit"
      :controls="true"
      :edit="editModeInt"
      :edit-button-text="$i18n.t('editView.edit')"
      :cancel-button-text="$i18n.t('editView.cancel')"
      :save-button-text="$i18n.t('editView.save')"
      :is-loading="isLoading"
      :subtitle="'(' + data.filter(item => !item.hidden).length + ')'"
      :title="entityType !== 'person' ? $t('detailView.lists') : $t('detailView.activityLists')"
      class="base-sr--ml-small"
      @activated="enableEdit"
      @canceled="cancel"
      @saved="save" />

    <BaseExpandList
      ref="baseExpandList"
      :edit="userCanEdit && editModeInt"
      :data="editModeInt
        ? data
        : data.filter(item => !item.hidden)"
      :show-more-text="$t('detailView.showAll')"
      :show-less-text="$t('detailView.showLess')"
      @saved="saveEdit">
      <template #content="{ data: listData }">
        <BaseLink
          :render-link-as="'nuxt-link'"
          :source="listData.source"
          :url="listData.url"
          :value="listData.value"
          class="base-sr-link--mr" />
        <template v-if="listData.attributes">
          - {{ listData.attributes.join(', ') }}
        </template>
      </template>
    </BaseExpandList>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  BaseEditControl,
  BaseExpandList,
} from 'base-ui-components';

import { userInfo } from '~/mixins/userNotifications';

import 'base-ui-components/dist/components/BaseEditControl/BaseEditControl.css';
import 'base-ui-components/dist/components/BaseExpandList/BaseExpandList.css';

Vue.use(BaseEditControl);
Vue.use(BaseExpandList);

export default {
  name: 'List',
  mixins: [userInfo],
  props: {
    /**
     * specify array to render list
     */
    data: {
      type: Array,
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
     * set type of entity<br>
     * e.g. 'activity' | 'person'
     */
    entityType: {
      type: String,
      default: 'activity',
    },
  },
  data() {
    return {
      dataInt: this.data,
      editModeInt: this.editMode,
      isLoading: false,
    };
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
        this.$emit('update:edit-mode', { name: 'list', editMode: val });
      }
    },
  },
  methods: {
    /**
     * enable edit mode
     */
    enableEdit() {
      this.editModeInt = true;
    },
    /**
     * cancel edit-mode
     */
    cancel() {
      this.editModeInt = false;
      this.$refs.baseExpandList.reset();
    },
    /**
     * load data with all languages
     */
    save() {
      this.editModeInt = false;
      this.$refs.baseExpandList.save();
    },
    /**
     * load data with all languages
     */
    saveEdit(val) {
      // TODO: we need id instead of manual mapping!!
      const data = val.map((listEntry) => ({
        id: listEntry.label.toLowerCase().replace('/', '_'),
        hidden: listEntry.hidden || false,
      }));
      this.$emit('update-list', { prop: 'list', data });
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
