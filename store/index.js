export const state = {

};

export const actions = {
  nuxtServerInit({ dispatch }, { $api }) {
    dispatch('searchData/init', $api);
    dispatch('appData/init', $api);
  },
};
