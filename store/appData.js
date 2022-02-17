/* eslint-disable no-shadow */
const state = () => ({
  locales: process.env.locales,
  locale: '',
  user: null,
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
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
