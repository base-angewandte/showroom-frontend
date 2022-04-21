const actions = {
  // eslint-disable-next-line no-unused-vars,consistent-return
  async nuxtServerInit({ dispatch, commit }, {
    $api, app, error, redirect, req, route, store,
  }) {
    /**
     * handle localisation and language switch
     */
    const availableLocales = store.state.appData.locales;

    // set default locale
    let locale = process.env.DEFAULT_LOCALE;

    // set browser default locale
    const browserLocale = req.headers['accept-language'] ? req.headers['accept-language'].slice(0, 2) : null;
    if (browserLocale && availableLocales.includes(browserLocale)) {
      locale = browserLocale;
    }

    // set local from cookie
    const cookieLocale = app.$cookies.get('locale');
    if (cookieLocale && availableLocales.includes(cookieLocale)) {
      locale = cookieLocale;
    }

    // if cookie locale is not available, remove it
    if (cookieLocale && !availableLocales.includes(cookieLocale)) {
      app.$cookies.remove('locale');
    }

    // set locale to app
    store.commit('appData/setLocale', locale);
    // eslint-disable-next-line no-param-reassign
    app.i18n.locale = locale;

    // check if path indicates a language switch
    const localeMatch = route.fullPath.match(/^\/([a-z]{2})\//);
    const pathLocale = localeMatch ? localeMatch[1] : null;
    if (pathLocale) {
      // set cookie with locale and redirect to path without lang attribute
      if (availableLocales.includes(pathLocale)) {
        app.$cookies.set('locale', pathLocale, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // one year
        });
        const path = route && route.fullPath ? route.fullPath.slice(3) : '/';
        return redirect(path);
      }
      // else throw 404
      return error({ message: app.i18n.t('errors.language'), statusCode: 404 });
    }

    // do initial requests AFTER language setting
    dispatch('appData/init', $api);
    await dispatch('searchData/init', $api);
  },
};

export default {
  actions,
};
