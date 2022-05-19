<template>
  <div>
    <h2 class="hide">
      {{ $t('detailView.activityLists') }}
    </h2>

    <BaseEditControl
      v-if="userCanEdit"
      :controls="true"
      :disabled="saveRequestOngoing"
      :edit="editModeInt"
      :edit-button-text="$i18n.t('editView.edit')"
      :save-button-text="$i18n.t('editView.ready')"
      :is-loading="isLoading || saveRequestOngoing"
      :subtitle="'(' + getItemCount(listData) + ')'"
      :title="entityType !== 'person' ? $t('detailView.lists') : $t('detailView.activityLists')"
      edit-mode="done"
      class="base-sr--ml-small"
      @activated="enableEdit"
      @canceled="editModeInt = false"
      @saved="save" />

    <BaseExpandList
      ref="baseExpandList"
      :edit="userCanEdit && editModeInt"
      :data="listData"
      :show-more-text="$t('detailView.showAll')"
      :show-less-text="$t('detailView.showLess')"
      :supportive-text="$t('editView.listText')"
      :edit-hide-text="$t('editView.listItemHide')"
      :edit-show-text="$t('editView.listItemShow')"
      :disabled="saveRequestOngoing"
      :expanded="expandedListItems"
      control-type="toggle"
      @expanded-state="setExpandedState"
      @update:data="saveEdit">
      <template #content="{ data: slotListData }">
        <!-- if entry has a link use baseLink -->
        <template
          v-if="slotListData.source || slotListData.url">
          <BaseLink
            :render-link-as="'nuxt-link'"
            :source="slotListData.source"
            :url="slotListData.url"
            :value="slotListData.value"
            class="base-sr-link--mr" />
          {{ slotListData.attributes ? ' - ' + slotListData.attributes.join(', ') : '' }}
        </template>
        <!-- else render plain text -->
        <template v-else>
          {{ slotListData.value }} {{ slotListData.attributes
            ? '- ' + slotListData.attributes.join(', ')
            : '' }}
        </template>
      </template>
    </BaseExpandList>

    <BaseExpandBox
      v-if="userCanEdit && !editModeInt && !listData.length"
      :auto-height="true"
      padding="small"
      class="base-sr-row">
      <span>{{ $t('editView.listNoResults') }}</span>
      <button
        class="base-sr-text-button"
        @click="enableEdit">
        {{ $t('editView.editNow') }}
      </button>.
    </BaseExpandBox>
  </div>
</template>

<script>
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions, mapGetters, mapMutations } from 'vuex';
import {
  BaseEditControl,
  BaseExpandList,
  BaseExpandBox,
} from 'base-ui-components';

import { userInfo } from '~/mixins/userNotifications';

import 'base-ui-components/dist/components/BaseEditControl/BaseEditControl.css';
import 'base-ui-components/dist/components/BaseExpandList/BaseExpandList.css';
import 'base-ui-components/dist/components/BaseExpandBox/BaseExpandBox.css';

Vue.use(BaseEditControl);
Vue.use(BaseExpandList);
Vue.use(BaseExpandBox);

/**
 * @typedef {Object} ListDataItem
 * @property {string} [id] - a unique id for the list item
 * @property {string} [label] - a label to be displayed for the category
 * @property {boolean} [hidden] - if category is hidden in view mode
 * @property {number} [count] - number of subitems in 'data' property
 * @property {number} [order] - the sort value of the item (array index, starting with 0)
 * @property {ListDataItem[]|ListDataValuesItem[]|string} [data] - an array either
 *  containing further data levels or the actual values to be displayed
 */

/**
 * @typedef {Object} ListDataValuesItem
 * @property {string} attributes
 * @property {string} source
 * @property {string} value
 * @property {string} url
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
      validator: (val) => ['person', 'object'].includes(val),
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
       * add a timeout before saving a list (especially for keyboard
       * list reordering)
       */
      saveTimeout: null,
      /**
       * variable to store if a save request is ongoing
       * @type {boolean}
       */
      saveRequestOngoing: false,
      /**
       * expanded state of list
       * * @type {array}
       */
      expandedListItems: [],

    };
  },
  computed: {
    ...mapGetters({
      getListStateItem: 'appData/getListStateItem',
    }),
    /**
     * the actual data used in BaseExpandList component depending on view or edit mode
     */
    listData: {
      /**
       * set internal variable dataInt with new data
       * @param {ListDataItem[]} val - updated data
       */
      set(val) {
        this.dataInt = val;
      },
      /**
       * @returns {ListDataItem[]}
       */
      get() {
        // check for edit mode - if edit mode - use edit data saved in store
        const data = this.editModeInt ? this.dataInt
          // else use internal data filtered by hidden elements and elements without content
          : this.dataInt.filter((item) => (!item.hidden && !!item.data.length));
        // add count property for correct bracket number
        return this.addItemCount(data);
      },
    },
    historyStateKey() {
      if (process.browser) {
        return window.history.state.key;
      }
      return null;
    },
    getExpandedState() {
      return this.getListStateItem(this.historyStateKey);
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
  mounted() {
    if (process.browser) {
      this.expandedListItems = this.getExpandedState;
    }
  },
  methods: {
    ...mapMutations({
      setListState: 'appData/setListState',
    }),
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
        this.listData = await this.fetchEditData({ type: 'list', id: this.$route.params.id });
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
     * trigger the safe function of the BaseExpandList component
     */
    save() {
      this.editModeInt = false;
      if (!this.saveRequestOngoing) {
        this.$refs.baseExpandList.save();
      }
    },
    /**
     * save the data
     */
    saveEdit(values, delay = 2000) {
      if (this.saveTimeout && delay) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }
      // set a timeout that especially keeps save from being triggered every time
      // the keyboard user triggers arrow key
      this.saveTimeout = setTimeout(async () => {
        try {
          // disable list elements while saving
          this.saveRequestOngoing = true;
          // serialize values to relevant data
          const serializedValues = values.map((value) => ({ id: value.id, hidden: value.hidden }));
          // update database entry
          const newData = await this.saveEditData({
            type: 'list',
            id: this.$route.params.id,
            values: serializedValues,
          });
          // necessary because if request was cancelled store function returns false
          if (newData) {
            this.listData = newData;
          }
        } catch (e) {
          console.error(e);
          // only inform user when operation failed
          this.informUser({
            action: 'save',
            count: 0,
            type: 'list',
            notificationType: 'error',
          });
        } finally {
          this.saveRequestOngoing = false;
        }
      }, delay);
    },
    /**
     * get the total of all items at the bottom level of the list
     * @param {ListDataItem[]} listItem - an array with objects with either data attribute
     *  or values (indicating the bottom level of the nested objects)
     * @returns {number}
     */
    getItemCount(listItem) {
      // check if list has objects with 'data' property
      if (listItem && listItem.length && listItem[0] && listItem[0].data) {
        // if yes call the function again for every item and add up the returned numbers
        return listItem.reduce((prev, curr) => this.getItemCount(curr.data) + prev, 0);
      }
      // if there is not 'data' attribute - indicating that there is no further sublevel
      // in the nested object just return the current array length
      return listItem.length;
    },
    addItemCount(list) {
      return list.map((listItem) => {
        // check if list has objects with 'data' property
        if (listItem.data && listItem.data.length) {
          return ({
            ...listItem,
            data: this.addItemCount(listItem.data),
            count: this.getItemCount(listItem.data),
          });
        }
        return listItem;
      });
    },
    /**
     * save expanded list state to store
     * @param {Array} state - expanded level, comma separated
     */
    setExpandedState(state) {
      // if state is set, store it to object
      if (state.length) {
        this.setListState({
          id: this.historyStateKey,
          data: state,
        });
      }
      // otherwise remove it
      if (!state.length && this.getExpandedState) {
        this.setListState({ id: this.historyStateKey, data: null });
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
