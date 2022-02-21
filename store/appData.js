/* eslint-disable no-shadow */
const state = () => ({
  locales: process.env.locales,
  locale: '',
  user: null,
  initialData: null,
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
  async fetchInitialData({ commit }, { limit }) {
    const requestBody = limit ? {
      limit,
    } : {};
    try {
      const response = await this.$api.public.api_v1_initial_retrieve({
        id: process.env.institutionId,
      },
      {
        requestBody,
      });
      if (response.data) {
        commit('setInitialData', JSON.parse(response.data));
      }
    } catch (e) {
      console.error(e);
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
