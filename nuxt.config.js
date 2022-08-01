/* eslint-disable */
require('dotenv').config({ path: './.env' });
const resolve = require('path').resolve;
const settings = require('./config/settings.js').default;
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');
const __CACHE_HASH__ = Date.now().toString();

export default {
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.APP_TITLE,
    meta: [
      { charset: 'utf-8' },
      { lang: 'en' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: settings.META.description.en },
      { name: 'apple-mobile-web-app-title', content: 'base' },
      { name: 'application-name', content: 'base' },
      { name: 'theme-color', content: '#ffffff' },
    ],
    link: [
      { rel: 'apple-touch-ico', sizes: '180x180', href: '/apple-touch-icon.png' },
      {
        rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png',
      },
      {
        rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png',
      },
      { rel: 'mask-icon', sizes: '180x180', href: '/safari-pinned-tab.svg' },
    ],
    script: [
      { src: `${process.env.HEADER}`, body: true },
      {
        hid: 'base-ui-icons-var',
        type: 'application/javascript',
        innerHTML: `var base_ui_icons = "${process.env.BASE_UI_ICONS}?${__CACHE_HASH__}"`,
      }
    ],
    __dangerouslyDisableSanitizersByTagID: {
      'base-ui-icons-var': ['innerHTML']
    },
  },
  router: {
    base: `${process.env.APP_PREFIX}/`,
    middleware: [
      'auth'
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: 'var(--app-color)', height: '1px' },
  /*
  ** Global CSS
  */
  css: [
    'normalize.css/normalize.css',
    'base-ui-components/dist/base-ui-components-common.css',
    '@/styles/main.scss',
  ],
  styleResources: {
    scss: [
      resolve(__dirname, 'styles/variables.scss'),
      resolve(__dirname, 'styles/fonts.scss')
    ]
  },
  env: {
    appBaseUrl: process.env.APP_BASE_URL,
    appPrefix: process.env.APP_PREFIX,
    appTitle: process.env.APP_TITLE,
    institutionId: process.env.INSTITUTION_ID,
    backendBaseUrl: process.env.BACKEND_BASE_URL,
    backendPrefix: process.env.BACKEND_PREFIX,
    apiSpecUrl: process.env.API_SPEC_URL,
    headerJson: process.env.HEADER_JSON,
    headerLogoutRedirectUrl: process.env.HEADER_LOGOUT_REDIRECT_URL,
    header: process.env.HEADER,
    headerUrlsTerms: process.env.HEADER_URLS_TERMS,
    headerUrlsNotice: process.env.HEADER_URLS_NOTICE,
    leaflet: settings.LEAFLET,
    meta: settings.META,
    locales: process.env.LOCALES,
    defaultLocale: process.env.DEFAULT_LOCALE,
    enTitleCasing: JSON.parse(process.env.EN_TITLE_CASING),
    userPreferencesUrl: process.env.USER_PREFERENCES_URL,
    authRequired: JSON.parse(process.env.AUTH_REQUIRED),
    searchResultRows: JSON.parse(process.env.SEARCH_RESULT_ROWS),
    baseIcons: `${process.env.BASE_UI_ICONS}?${__CACHE_HASH__}`
  },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/api.js',
    '~/plugins/axios.js',
    '~/plugins/i18n.js',
    {
      src: '~/plugins/localstorage.js',
      mode: 'client',
    },
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/router',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
    'cookie-universal-nuxt',
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseUrl: (process.env.APP_BASE_URL || 'http://localhost:3000') + (process.env.APP_PREFIX || '/'),
  },
  /*
  ** Build configuration
  */
  build: {
    // analyze: true,
    cache: false,
    extractCss: false,
    /*
    ** You can extend webpack config here
    */
    extend: function (config, {isDev, isClient}) {
      // for dotenv import error (fs not defined)
      config.node = {
        fs: "empty"
      };
      // for preventing linter checking npm linked base-ui-components
      if (isDev) config.resolve.symlinks = false;
    },
  },
  pageTransition: {
    name: 'page',
    mode: 'out-in',
  },
};
