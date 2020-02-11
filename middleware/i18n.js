/* eslint-disable consistent-return */
export default function ({
  isHMR, app, store, route, params, error, redirect,
}) {
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return;
  // for the font path
  if (route.fullPath.includes('/bs')) return;
  const currentLocale = store.state.appData.locale;
  // if the locale is already set and the path does not indicate
  // that locale will change (/en or /de) or if path has locale but it is
  // the same as already set also return
  if ((currentLocale && !params.lang)
    || (params.lang && params.lang === currentLocale)) return;
  const availableLocales = store.state.appData.locales;
  // else set initial locale
  let locale = currentLocale || app.i18n.fallbackLocale;
  // get from route if set
  if (params && params.lang) {
    locale = params.lang;
  }
  // check if the requested locale exists
  if (locale && !availableLocales.includes(locale)) {
    return error({ message: 'This language is not available.', statusCode: 404 });
  }
  // Finally set locale
  store.commit('appData/SET_LANG', locale);
  // eslint-disable-next-line no-param-reassign
  app.i18n.locale = locale;
  // if on client remove the leading locale path from the route
  if (process.client && route.fullPath.indexOf(`/${locale}`) === 0) {
    localStorage.setItem('lang', locale);
    return redirect(route.fullPath.replace(/^\/[a-z]{2}/, ''));
  }
}
