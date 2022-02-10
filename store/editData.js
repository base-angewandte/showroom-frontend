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
    Vue.set(state.editData[id], type, values);
  },
};

const actions = {
  async fetchEditData({ commit }, { type, id }) {
    const apiPath = `api_v1_entities_${type === 'list' ? 'list_list' : 'edit_retrieve'}`;
    const response = await this.$api.auth[apiPath]({
      id,
      [type]: true,
    });
    if (response.data) {
      const values = JSON.parse(response.data);
      commit('setEditDataItem', { type, values, id });
    } else {
      throw new Error('no data');
    }
  },
  async saveEditData(context, { type, id, values }) {
    const requestOperationId = `api_v1_entities_${type === 'list' ? 'list' : 'edit'}_partial_update`;
    const requestBody = type === 'list' ? values : {
      [type]: values,
    };
    const response = await this.$api.auth[requestOperationId](
      {
        id,
      },
      {
        requestBody,
      },
    );
    if (response.data) {
      return JSON.parse(response.data);
    }
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
