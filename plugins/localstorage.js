export default ({
  isHMR, route, store, redirect, app,
}) => {
  if (isHMR) return;
  // this second middleware in general was created for local storage
  // functionalities since sessionStorage
  // can not be accessed from i18n.js (serverside rendered)
  // eslint-disable-next-line consistent-return
  window.onNuxtReady(() => {
    // check if route contains locale
    const locale = route && route.fullPath ? route.fullPath.split('/')[1] : '';
    // if yes, set the new language and redirect to route without locale
    if (store.state.appData.locales.some((l) => l === locale)) {
      const path = route && route.fullPath ? route.fullPath.slice(3) : '/';
      window.localStorage.setItem('lang', locale);
      // eslint-disable-next-line no-param-reassign
      app.i18n.locale = store.state.appData.locale;
      return redirect(path);
    // if not, set the lang to what is stored in session storage
    }
    store.commit('appData/SET_LANG', window.localStorage.getItem('lang'));
    // eslint-disable-next-line no-param-reassign
    app.i18n.locale = store.state.appData.locale;
  });
};
