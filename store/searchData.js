/* eslint-disable no-shadow */
const state = () => ({
  filters: [],
  entityFilters: {},
  latestSearchResults: {},
});

const getters = {
  getFilters(state) {
    return state.filters || [];
  },
  getEntityFilters: (state) => (id) => state.entityFilters[id],
  getLatestSearchResults: (state) => (id) => state.latestSearchResults[id],
};

const mutations = {
  setFilters(state, filters) {
    state.filters = filters;
  },
  setEntityFilters(state, { data, id }) {
    state.entityFilters[id] = data;
  },
  setLatestSearchResults(state, { data, id, searchParams }) {
    if (state.latestSearchResults) {
      if (state.latestSearchResults[id]) {
        state.latestSearchResults[id][searchParams] = data;
      } else {
        state.latestSearchResults[id] = {
          [searchParams]: data,
        };
      }
    } else {
      state.latestSearchResults = {
        [id]: data,
      };
    }
  },
};

const actions = {
  async fetchFilterData({ commit, getters }) {
    // get filters are already in store
    const filtersInStore = getters.getFilters;
    // if they exist just return those
    if (filtersInStore && filtersInStore.length) {
      return filtersInStore;
    }
    // else fetch them from backend
    const { data } = await this.$api.public.api_v1_filters_list();
    if (data) {
      const parsedData = JSON.parse(data);
      // this is mainly if a cancelled request returns false as value
      // TODO: this seems not ideal
      if (parsedData) {
        commit('setFilters', JSON.parse(data));
      }
      return JSON.parse(data);
    }
    return [];
  },
  async fetchEntityFilterData({ commit, getters }, id) {
    const filtersForId = getters.getEntityFilters(id);
    if (filtersForId) {
      return filtersForId;
    }
    const { data } = await this.$api.public.api_v1_entities_filters_retrieve({
      id,
    });
    if (data) {
      const entityFilterData = JSON.parse(data);
      // this is mainly if a cancelled request returns false as value
      // TODO: this seems not ideal
      if (entityFilterData) {
        commit('setEntityFilters', { data: entityFilterData, id });
      }
      return entityFilterData;
    }
    return [];
  },
  /**
   *
   * @param {Object} context - the Nuxt context object
   * @param {string} queryString - the autocomplete string entered by the user
   * @param {string} filterId - the currently applied filter id
   * @param {number} [limit=20] - a limit for the number of items to be returned
   * @param {string?} routeParam - operationId identifier for different routes (e.g. entities)
   * @param {string?} entityId - the entity id if request should be made for entity route
   * @returns {Promise<boolean|*[]>}
   */
  async fetchAutocomplete(context, {
    queryString, filterId, limit = 20, routeParam, entityId,
  }) {
    // set query params object here which would be needed for entities route
    const queryParams = entityId ? {
      id: entityId,
    } : {};
    // asseble the correct operationId
    const operationId = `api_v1_${routeParam ? `${routeParam}_` : ''}autocomplete_create`;
    // this is to prepare for multiple requests however request cancellation is currently a
    // problem so there can not be more than one request
    const filterIds = [].concat(filterId);
    // needed to add trim because space leads to evaluation true
    if (queryString && queryString.trim()) {
      // this is to prepare for multiple requests however request cancellation is currently a
      // problem so there can not be more than one request
      const requests = filterIds.map((id) => this.$api.public[operationId](queryParams, {
        requestBody: {
          q: queryString,
          filter_id: id,
          limit,
        },
      }));
      const responses = await Promise.all(requests);
      if (responses && responses.length) {
        let results = [];
        responses.forEach((response) => {
          if (response.data && typeof response.data === 'string') {
            const responseResult = JSON.parse(response.data);
            // now check if parsed string is actual results (if request was cancelled this has
            // the value false
            // TODO: check if there is better solution to handle requestCancellation
            if (responseResult) {
              // if yes - add them to results array
              results = results.concat(responseResult);
            }
          }
        });
        return results;
      }
      return false;
    }
    return [];
  },
  async fetchSearch(context, {
    requestBody, routeParam, entityId,
  }) {
    const queryParams = entityId ? {
      id: entityId,
    } : {};
    const operationId = `api_v1_${routeParam ? `${routeParam}_` : ''}search_create`;
    const { data } = await this.$api.public[operationId](queryParams, { requestBody });
    if (data && typeof data === 'string') {
      const parsedResults = JSON.parse(data);
      if (parsedResults) {
        return [].concat(parsedResults);
      }
    }
    return false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
