/* eslint-disable no-shadow */
const state = () => ({
  locales: process.env.locales,
  locale: '',
  user: null,
  /**
   * data for landing page which however are also used for base carousel mock data
   * (since only loaded once they should be available already everytime i navigate
   * to a page)
   * @type {?Object}
   */
  initialData: null,
  /**
   * this is universal depending solely on page resize so it should
   * be available for all pages
   * this is starting with the smallest number because otherwise higher page
   * numbers are not rendered with small screensize
   * @type {number}
   */
  itemsPerRow: 2,
  listState: {},
});

const getters = {
  getUser(state) {
    return state.user;
  },
  getAuthState(state) {
    return !!state.user;
  },
  getLocales(state) {
    return state.locales;
  },
  getLocale(state) {
    return state.locale;
  },
  getUserId(state) {
    return state.user ? state.user.entity_id : null;
  },
  getUserEditPermissions(state) {
    return state.user ? state.user.entity_editing : null;
  },
  getInitialData(state) {
    return state.initialData;
  },
  getInitialShowcaseData: (state) => (limit, filterForImage = false) => {
    if (state.initialData && state.initialData.showcase) {
      const carouselData = state.initialData.showcase;
      if (filterForImage) {
        carouselData.filter((entry) => !!entry.previews.length);
      }
      if (limit) {
        return carouselData.slice(0, limit).map((entry) => ({
          ...entry,
          href: entry.id,
        }));
      }
      return carouselData.map((entry) => ({
        ...entry,
        href: entry.id,
      }));
    }
    return [];
  },
  getItemsPerRow: (state) => state.itemsPerRow,
  getListStateItem: (state) => (id) => {
    if (id && state.listState && state.listState[id]) {
      return state.listState[id];
    }
    return [];
  },
};

const mutations = {
  setLocale(state, locale) {
    if (state.locales.includes(locale)) {
      state.locale = locale;
    }
  },
  setUser(state, user) {
    if (user && user.id) {
      state.user = user;
    } else {
      state.user = null;
    }
  },
  setInitialData(state, data) {
    state.initialData = data;
  },
  setItemsPerRow(state, data) {
    state.itemsPerRow = data;
  },
  setListState(state, { id, data }) {
    if (data) {
      state.listState[id] = data;
    } else {
      delete state.listState[id];
    }
  },
};

const actions = {
  async init({ dispatch }, api) {
    await dispatch('fetchUser', api.auth.api_v1_user_retrieve);
  },
  async fetchUser({ commit }, request) {
    try {
      const { data } = await request();
      if (data) {
        commit('setUser', JSON.parse(data));
      }
    } catch (e) {
      // check if request failed because user is not authenticated and reset user
      if (e.response && e.response.status === 403) {
        commit('setUser');
      } else {
        console.error(e);
      }
    }
  },
  /**
   * request for fetching initial results for start page (but also used for default carousel
   * data on entity page)
   *
   * @param getters
   * @param commit
   * @param {number} [limit=100] - a limit applied to the initial request
   * @param {boolean} [forceFetch=false] - determine if request should be sent rather than take
   *  data already available
   * @returns {Promise<boolean|*[]>}
   */
  async fetchInitialData({ getters, commit }, { limit = 100, forceFetch = false }) {
    // get the data already in the store if there are any
    const storedInitialData = getters.getInitialData;
    // check if data are here and if these data have results, and if so if the results length
    // covers the set limit
    if (!forceFetch && storedInitialData && storedInitialData.results
      && storedInitialData.results.length
      && storedInitialData.results[0].data.length >= limit) {
      return storedInitialData.results;
    }
    // if not fetch the data anew
    const response = await this.$api.public.api_v1_initial_retrieve({
      id: process.env.institutionId,
      requestBody: {
        limit,
      },
    });
    // check if response data came back
    if (response.data) {
      // if yes - parse them
      const parsedData = JSON.parse(response.data);
      // now check if they are not boolean false (for request cancellation)
      if (parsedData) {
        // save them in store
        commit('setInitialData', parsedData);
        // return only the search results to the component
        return [].concat(parsedData.results) || [];
      }
    }
    // return false for cancellation
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
