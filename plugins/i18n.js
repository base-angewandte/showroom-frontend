/* eslint-disable global-require */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable-next-line */
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import MessageFormat from 'messageformat';
// eslint-disable-next-line import/no-cycle
import { toTitleString } from '@/utils/common';

require('dotenv').config({ path: './.env' });

const en = require('~/locales/en.json');
const de = require('~/locales/de.json');

Vue.use(VueI18n);

// custom formatter for including text styling (upper lower case)
class CustomFormatter {
  constructor(options = {}) {
    this._locale = options.locale || 'en';
    this._formatter = new MessageFormat(this._locale);
    this._caches = Object.create(null);
  }

  interpolate(message, values) {
    let fn = this._caches[message];
    if (!fn) {
      fn = this._formatter.compile(message, this._locale);
      this._caches[message] = fn;
    }
    return [values && values.toTitleCase === false
      ? fn(values) : toTitleString(fn(values), this._locale)];
  }
}

export default ({ app, store }) => {
  /* eslint-disable-next-line no-extra-boolean-cast */
  const customFormaterObject = JSON.parse(process.env.enTitleCasing)
    ? { formatter: new CustomFormatter({ locale: store.state.appData.locale }) } : {};

  // Set i18n instance on app
  // This way we can use it in middleware and pages asyncData/fetch
  app.i18n = new VueI18n({
    locale: store.state.appData.locale,
    ...customFormaterObject,
    fallbackLocale: process.env.defaultLocale,
    messages: {
      en,
      de,
    },
  });
};
