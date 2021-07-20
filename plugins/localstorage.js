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
    const localeMatch = route.fullPath.match(/^\/([a-z]{2})/);
    const currentLocale = localeMatch ? localeMatch[1] : '';
    const availableLocales = JSON.parse(store.state.appData.locales);
    // if yes, set the new language and redirect to route without locale
    if (availableLocales.includes(currentLocale)) {
      const path = route && route.fullPath ? route.fullPath.slice(3) : '/';
      window.localStorage.setItem('lang', currentLocale);
      return redirect(path);
    }
    // if not, set the lang to what is stored in session storage or
    // browser default or application default
    const defaultLocale = window.localStorage.getItem('lang')
      || navigator.language.slice(0, 2) || process.env.defaultLocale;
    store.commit('appData/setLocale', defaultLocale);
    // eslint-disable-next-line no-param-reassign
    app.i18n.locale = defaultLocale;
  });
};
