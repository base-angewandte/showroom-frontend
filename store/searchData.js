/* eslint-disable no-shadow */
const state = () => ({
  filters: [],
});

const getters = {
  getFilters(state) {
    return state.filters;
  },
};

const mutations = {
  setFilters(state, filters) {
    state.filters = filters.filter((filter) => !filter.hidden);
  },
};

const actions = {
  init({ dispatch }, api) {
    return dispatch('fetchFilterData', api.public.api_v1_filters_list);
  },
  async fetchFilterData({ commit }, request) {
    try {
      const { data } = await request();
      if (data) {
        commit('setFilters', JSON.parse(data));
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
      // TODO: reconsider error handling (add redirect here? or let error
      //  bubble up to nuxt server init?)
    }
    return [];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
