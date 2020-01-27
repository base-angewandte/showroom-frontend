export default ({
  app, isHMR, route, store,
}) => {
  if (isHMR) return;
  // this second middleware in general was created for local storage
  // functionalities since sessionStorage
  // can not be accessed from i18n.js (serverside rendered)
  // TODO: this is currently not ideas - double set with beforeEnter hook!
  // check again if this makes sense and refactor
  // eslint-disable-next-line consistent-return
  window.onNuxtReady(() => {
    // check if route contains locale
    const locale = route && route.fullPath ? route.fullPath.split('/')[1] : '';
    // if yes, set the new language and redirect to route without locale
    if (store.state.appData.locales.some((l) => l === locale)) {
      // const path = route && route.fullPath ? route.fullPath.slice(3) : '/';
      window.localStorage.setItem('lang', locale);
      // eslint-disable-next-line no-param-reassign
      app.i18n.locale = store.state.appData.locale;
      // removed this for now because interferring with beforeEnter Routeguard
      // return redirect(path);
    // if not, set the lang to what is stored in session storage
    }
    store.commit('appData/SET_LANG', window.localStorage.getItem('lang'));
    // eslint-disable-next-line no-param-reassign
    app.i18n.locale = store.state.appData.locale;
  });
};
