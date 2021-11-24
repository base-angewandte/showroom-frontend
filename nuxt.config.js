/* eslint-disable */
require('dotenv').config({ path: './.env' });
const resolve = require('path').resolve;
const settings = require('./config/settings.js').default;

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
      { hid: 'description', name: 'description', content: process.env.APP_TITLE },
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
    ],
  },
  router: {
    base: `${process.env.APP_PREFIX}/`,
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
    header: process.env.HEADER,
    headerUrlsTerms: process.env.HEADER_URLS_TERMS,
    headerUrlsNotice: process.env.HEADER_URLS_NOTICE,
    leaflet: settings.LEAFLET,
    locales: process.env.LOCALES,
    defaultLocale: process.env.DEFAULT_LOCALE,
    enTitleCasing: process.env.EN_TITLE_CASING,
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
    afterLeave() {
      window.scrollTo(0, 0);
    },
  },
};
