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
    return state.authenticated;
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
      state.authenticated = true;
    } else {
      state.user = null;
      state.authenticated = false;
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
        // check if app is set to only allow authenticated users to view the app
        if (process.env.authRequired) {
          // if so bubble an error to triggering nuxtServerInit function
          throw e;
        } else {
          commit('setUser');
        }
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
