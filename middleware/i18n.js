/* eslint-disable consistent-return */

// TODO: this is currently just copy pasted from nuxtjs.org - adjust to our needs!!

export default function ({
  isHMR, app, store, route, params, error, redirect,
}) {
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return;
  // for the font path
  if (route.fullPath.includes('/bs')) return;
  // if the locale is already set and the path does not indicate
  // that locale will change (/en or /de)
  // also return
  if (store.state.appData.locale && !params.lang) return;
  // else set initial locale
  let { locale } = store.state.appData;
  // get from route if set
  if (params && params.lang) {
    locale = params.lang;
  // else try to infer from request header or set default to en
  } else {
    locale = navigator.language.slice(0, 2) || app.i18n.fallbackLocale;
  }
  // check if the requested locale exists
  if (!store.state.appData.locales.includes(locale)) {
    return error({ message: 'This page could not be found.', statusCode: 404 });
  }
  // Finally set locale
  store.commit('appData/SET_LANG', locale);
  // eslint-disable-next-line no-param-reassign
  app.i18n.locale = locale;
  // if on client remove the leading locale path from the route
  if (process.client && store.state.appData.locales.includes(locale) && route.fullPath.indexOf(`/${locale}`) === 0) {
    localStorage.setItem('lang', locale);
    return redirect(route.fullPath.replace(/^\/de|^\/en/, ''));
  }
}
