/* eslint-disable no-shadow */
const state = () => ({
  filters: [],
  categories: [],
  appliedFilters: {},
});

const getters = {
  getFilters(state) {
    return state.filters;
  },
  getCategories(state) {
    return state.categories;
  },
  getAppliedFiltersById(state) {
    return (id) => state.appliedFilters[id];
  },
};

const mutations = {
  setFilters(state, filters) {
    state.filters = filters;
  },
  setCategories(state, categories) {
    state.categories = categories;
  },
  setAppliedFilters(state, { id, filters }) {
    state.appliedFilters[id] = filters || [];
  },
};

const actions = {
  init({ dispatch }, api) {
    dispatch('fetchFilterData', api.public.api_v1_filters_list);
    dispatch('fetchCategoryData', api.public.api_v1_categories_list);
  },
  async fetchFilterData({ commit }, request) {
    try {
      const { data } = await request();
      if (data) {
        commit('setFilters', JSON.parse(data));
      }
    } catch (e) {
      console.error(e);
      // TODO: reconsider error handling (add redirect here? or let error
      //  bubble up to nuxt server init?)
    }
  },
  async fetchCategoryData({ commit }, request) {
    try {
      const { data } = await request();
      if (data) {
        commit('setCategories', JSON.parse(data));
      }
    } catch (e) {
      console.error(e);
      // TODO: reconsider error handling (add redirect here? or let
      //  error bubble up to nuxt server init?)
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
