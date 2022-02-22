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

/**
 * @typedef {Object} ListDataItem
 * @property {string} [id] - a unique id for the list item
 * @property {string} [label] - a label to be displayed for the category
 * @property {boolean} [hidden] - if category is hidden in view mode
 * @property {number} [order] - the sort value of the item (array index, starting with 0)
 * @property {ListDataItem[]|ListDataValuesItem[]|string} [data] - an array either
 *  containing further data levels or the actual values to be displayed
 */

/**
 * @typedef {Object} ListDataValuesItem
 * @property {string} attributes
 * @property {string} source
 * @property {string} value
 */

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
      validator: (val) => ['activity', 'person'].includes(val),
    },
  },
  data() {
    return {
      /**
       * internal variable handling edit or view mode
       * @type {boolean}
       */
      editModeInt: this.editMode,
      /**
       * indicate if loader should be shown
       * @type {boolean}
       */
      isLoading: false,
      /**
       * internal representation of the display data
       * @type {ListDataItem[]}
       */
      dataInt: this.data,
      /**
       * a variable to store state of data before editing (in case state
       * needs to be restored due to cancel action)
       * @type {ListDataItem[]}
       */
      dataBeforeEditing: [],
    };
  },
  computed: {
    ...mapGetters({
      getEditDataItem: 'editData/getEditDataItem',
    }),
    /**
     * the actual data used in BaseExpandList component depending on view or edit mode
     */
    listData: {
      set(val) {
        this.dataInt = val;
      },
      /**
       * @returns {ListDataItem[]}
       */
      get() {
        // check for edit mode
        return this.editModeInt
          // if edit mode - use edit data saved in store
          ? this.getEditDataItem({ type: 'list', id: this.$route.params.id })
          // else use internal data filtered by hidden elements and elements without content
          : this.dataInt.filter((item) => (!item.hidden && !!item.data.length));
      },
    },
  },
  watch: {
    /**
     * keep edit mode in sync with parent state
     */
    editMode: {
      handler(val) {
        this.editModeInt = val;
      },
      immediate: true,
    },
    /**
     * keep edit mode in sync with parent state
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
        // store original edit data in a variable so they can be restored in case of cancel
        this.dataBeforeEditing = JSON.parse(JSON.stringify(this.listData));
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
      // still update list with latest fetched version of data!
      this.listData = JSON.parse(JSON.stringify(this.dataBeforeEditing));
      this.$refs.baseExpandList.reset();
    },
    /**
     * trigger the safe function of the BaseExpandList component
     */
    save() {
      this.$refs.baseExpandList.save();
    },
    /**
     * save the data
     */
    async saveEdit(values) {
      // variable for determining notification message later
      let success = false;
      try {
        // update database entry with relevant data
        this.listData = await this.saveEditData({ type: 'list', id: this.$route.params.id, values });
        // update before editing data with latest changes (currently not really necessary because
        // edit mode is closed after save anyway but in case this should change in future)
        this.dataBeforeEditing = JSON.parse(JSON.stringify(this.listData));
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
