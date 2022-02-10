import Vue from 'vue';

/* eslint-disable no-shadow */
const state = () => ({
  editData: {},
});

const getters = {
  getEditData: (state) => state.editData,
  getEditDataEntity: (state) => (id) => state.editData[id],
  getEditDataItem: (state) => ({ type, id }) => {
    if (state.editData[id]) {
      return state.editData[id][type];
    }
    return null;
  },
};

const mutations = {
  setEditData(state, payload) {
    state.editData = payload;
  },
  setEditDataEntity(state, { id, values }) {
    if (!state.editData[id]) {
      state.editData[id] = {};
    }
    Vue.set(state.editData, id, values);
  },
  setEditDataItem(state, { id, type, values }) {
    if (!state.editData[id]) {
      state.editData[id] = {};
      state.editData[id][type] = null;
    }
    Vue.set(state.editData[id], type, values[type] || values);
  },
};

const actions = {
  /**
   * function to fetch edit data
   * @param {Function} commit
   * @param {string} type - the type of data that should be fetched
   *  (e.g. 'list', 'secondary_details')
   * @param {string} id - the entity id
   * @returns {Promise<any>}
   */
  async fetchEditData({ commit }, { type, id }) {
    const apiPath = `api_v1_entities_${type === 'list' ? 'list' : 'edit'}_retrieve`;
    const response = await this.$api.auth[apiPath]({
      id,
      [type]: true,
    });
    if (response.data) {
      const values = JSON.parse(response.data);
      commit('setEditDataItem', { type, values: values[type] || values, id });
      return values[type] || values;
    }
    throw new Error('no data');
  },
  /**
   * function for updating edited entity data
   * @param {Object} context - store context
   * @param {string} type - the data property that should be updated
   * @param {string} id - the entity id
   * @param {Object[]} values - the new values to be submitted
   * @returns {Promise<any>}
   */
  async saveEditData(context, { type, id, values }) {
    // set the correct operationId (which is different for 'list' type)
    const requestOperationId = `api_v1_entities_${type === 'list' ? 'list' : 'edit'}_partial_update`;
    // create the request body (again - different for list items)
    const requestBody = type === 'list' ? values : {
      [type]: values,
    };
    // do the actual request
    const response = await this.$api.auth[requestOperationId](
      {
        id,
      },
      {
        requestBody,
      },
    );
    // check if data were received
    if (response.data) {
      // if so parse the data
      const updatedData = JSON.parse(response.data);
      // and return them
      return updatedData[type] || updatedData;
    }
    // if not throw an error
    throw new Error('no data');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
