/* eslint-disable */

require('dotenv').config({ path: './.env' });
const resolve = require('path').resolve;

export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: 'Showroom | base Angewandte',
    meta: [
      { charset: 'utf-8' },
      { lang: 'en' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Recherche | base Angewandte' },
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
      { src: `${process.env.BASE_HEADER_REPO}/${process.env.HEADER}`, body: true },
    ],
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    'normalize.css/normalize.css',
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
  },
  router: {
    middleware: 'i18n',
  },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/i18n.js',
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
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
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    },
  },
};
