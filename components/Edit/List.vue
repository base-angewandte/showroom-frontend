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
      :subtitle="'(' + listData.length + ')'"
      :title="entityType !== 'person' ? $t('detailView.lists') : $t('detailView.activityLists')"
      class="base-sr--ml-small"
      @activated="enableEdit"
      @canceled="cancel"
      @saved="save" />

    <BaseExpandList
      ref="baseExpandList"
      :edit="userCanEdit && editModeInt"
      :data="listData"
      :show-more-text="$t('detailView.showAll')"
      :show-less-text="$t('detailView.showLess')"
      @saved="saveEdit">
      <template #content="{ data: slotListData }">
        <BaseLink
          :render-link-as="'nuxt-link'"
          :source="slotListData.source"
          :url="slotListData.url"
          :value="slotListData.value"
          class="base-sr-link--mr" />
        <template v-if="slotListData.attributes">
          - {{ slotListData.attributes.join(', ') }}
        </template>
      </template>
    </BaseExpandList>
  </div>
</template>

<script>
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions, mapGetters } from 'vuex';
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
      editModeInt: this.editMode,
      isLoading: false,
      dataInt: this.data,
    };
  },
  computed: {
    ...mapGetters({
      getEditDataItem: 'editData/getEditDataItem',
    }),
    listData: {
      set(val) {
        this.dataInt = val;
      },
      get() {
        return this.editModeInt
          ? this.getEditDataItem({ type: 'list', id: this.$route.params.id })
          : this.dataInt.filter((item) => (!item.hidden && !!item.data.length));
      },
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
        this.$emit('update:edit-mode', { name: 'list', editMode: val });
      }
    },
  },
  methods: {
    ...mapActions({
      fetchEditData: 'editData/fetchEditData',
      saveEditData: 'editData/saveEditData',
    }),
    /**
     * enable edit mode
     */
    async enableEdit() {
      try {
        // fetch edit data from store
        await this.fetchEditData({ type: 'list', id: this.$route.params.id });
        // if data fetch worked out set edit mode to true
        this.editModeInt = true;
      } catch (e) {
        console.error(e);
        this.informUser({
          action: 'fetch',
          count: 0,
          type: 'list',
          notificationType: 'error',
        });
      }
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
      // this.editModeInt = false;
      this.$refs.baseExpandList.save();
    },
    /**
     * load data with all languages
     */
    async saveEdit(values) {
      // variable for determining notification message later
      let success = false;
      try {
        // update database entry with relevant data
        this.listData = await this.saveEditData({ type: 'list', id: this.$route.params.id, values });
        // set edit mode false again
        this.editModeInt = false;
        success = true;
      } catch (e) {
        console.error(e);
      } finally {
        this.informUser({
          action: 'save',
          count: 0,
          type: 'list',
          notificationType: success ? 'success' : 'error',
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
