/* eslint-disable no-shadow */
const state = () => ({
  filters: [],
  entityFilters: {},
});

const getters = {
  getFilters(state) {
    return state.filters || [];
  },
  getEntityFilters: (state) => (id) => state.entityFilters[id],
};

const mutations = {
  setFilters(state, filters) {
    state.filters = filters;
  },
  setEntityFilters(state, { data, id }) {
    state.entityFilters[id] = data;
  },
};

const actions = {
  async fetchFilterData({ commit }) {
    try {
      const { data } = await this.$api.public.api_v1_filters_list();
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
  async fetchEntityFilterData({ commit, getters }, id) {
    const filtersForId = getters.getEntityFilters(id);
    if (filtersForId) {
      return filtersForId;
    }
    try {
      const { data } = await this.$api.public.api_v1_entities_filters_retrieve({
        id,
      });
      if (data) {
        const entityFilterData = JSON.parse(data);
        commit('setEntityFilters', { data: entityFilterData, id });
        return entityFilterData;
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
