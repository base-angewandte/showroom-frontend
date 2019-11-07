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

};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
