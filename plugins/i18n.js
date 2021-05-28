/* eslint-disable global-require */
/* eslint-disable no-param-reassign */
/* eslint-disable-next-line */
import Vue from 'vue';
import VueI18n from 'vue-i18n';

require('dotenv').config({ path: './.env' });

const en = require('~/locales/en.json');
const de = require('~/locales/de.json');

Vue.use(VueI18n);

export default ({ app, store }) => {
  // Set i18n instance on app
  // This way we can use it in middleware and pages asyncData/fetch
  app.i18n = new VueI18n({
    locale: store.state.appData.locale,
    fallbackLocale: process.env.defaultLocale,
    messages: {
      en,
      de,
    },
  });
};
