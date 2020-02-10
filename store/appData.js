/* eslint-disable no-shadow */
const state = () => ({
  locales: ['de', 'en'],
  locale: 'en',
  authenticated: false,
  user: null,
});

const getters = {

};

const mutations = {
  SET_LANG(state, locale) {
    if (state.locales.includes(locale)) {
      state.locale = locale;
    }
  },
  SET_USER(state, user) {
    if (user && user.uuid) {
      state.user = user;
      state.authenticated = true;
    } else {
      state.user = null;
      state.authenticated = false;
    }
  },
};

const actions = {
  init({ dispatch }) {
    dispatch('fetchUser');
  },
  async fetchUser({ commit }) {
    try {
      const { data } = await this.$axios.get('http://localhost:8200/api/v1/user', {
        withCredentials: true,
        xsrfCookieName: 'csrftoken_portfolio',
        xsrfHeaderName: 'X-CSRFToken',
      });
      if (data) {
        commit('SET_USER', data);
      }
    } catch (e) {
      // check if request failed because user is not authenticated and reset user
      if (e.response && e.response.status === 403) {
        commit('SET_USER');
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
