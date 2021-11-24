import Vue from 'vue';
import i18n from '@/plugins/i18n';

// eslint-disable-next-line import/prefer-default-export
export const metaTags = (routerPath, currentLang) => {
  const locales = JSON.parse(process.env.locales);
  const data = [];

  // add alternate tag for all locales
  if (locales) {
    locales.forEach((locale) => {
      data.push({
        rel: 'alternate',
        href: `${process.env.appBaseUrl}${process.env.appPrefix}/${locale}${routerPath}`,
        hrefLang: locale,
      });
    });
  }

  // add canonical url
  data.push({
    rel: 'canonical',
    href: `${process.env.appBaseUrl}${process.env.appPrefix}/${currentLang}${routerPath}`,
  });

  return data;
};

export const toTitleString = (string = '', language) => {
  if (!string) {
    return '';
  }
  const functionLang = language || i18n.locale || 'en';
  const sentenceIndicators = /[.!?:]$/;
  const enTitleCasing = process.env.EN_TITLE_CASING || process.env.enTitleCasing;
  if (enTitleCasing && functionLang === 'en' && string.search(sentenceIndicators) < 0) {
    /* this function was taken from:
    To Title Case © 2018 David Gouch | https://github.com/gouch/to-title-case
    */
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
    const alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/;
    const wordSeparators = /([ /:–—-])/;

    return string.split(wordSeparators)
      .map((current, index, array) => {
        const isSmallWord = current.search(smallWords) > -1;
        if (
          /* Check for small words */
          isSmallWord
          /* Skip first and last word */
          && index !== 0 && index !== array.length - 1
          /* Ignore title end and subtitle start */
          && array[index - 3] !== ':' && array[index + 1] !== ':'
          /* Ignore small words that start a hyphenated phrase */
          && (array[index + 1] !== '-' || (array[index - 1] === '-' && array[index + 1] === '-'))
        ) {
          // ignore single letters so they remain capitalized if they already were
          // (e.g. 'A' from 'A - Z')
          if (current.length !== 1) {
            return current.toLowerCase();
          }
          return current;
        }

        /* Ignore intentional capitalization */
        if (current.substr(1)
          .search(/[A-Z]|\../) > -1) {
          return current;
        }

        /* Ignore URLs */
        if (array[index + 1] === ':' && array[index + 2] !== '') {
          return current;
        }

        /* Capitalize the first letter */
        return current.replace(alphanumericPattern, (match) => match.toUpperCase());
      })
      .join('');
  }
  return string;
};

/**
 * function to check if provided value object has a label and language specific values therein
 *
 * @param {Object} value - the value object to check - in order for a title casing to be applied
 * the object needs to contain the following structure:
 *  {
 *    label: 'Label to title case'),
 *  },
 * @returns {Object} - the same object with en label string title cased
 */
export const checkForLabel = (value) => {
  let newValue = value;
  // check if value is array or object
  if (newValue && typeof value === 'object') {
    // check if value is array
    if (newValue.length) {
      // if yes - go through every single item
      newValue = newValue.map((entry) => checkForLabel(entry));
      // else check if there the object has properties
    } else if (Object.keys(newValue).length) {
      // check if these properties include a label and if the label object has an 'en' property
      if (Object.keys(newValue).includes('label')) {
        Vue.set(newValue, 'label', toTitleString(newValue.label));
      }
      // also check if there are deeper nested object properties that need translation (e.g. roles)
      newValue = Object.entries(newValue)
        .reduce((prev, [propKey, propValue]) => ({
          ...prev,
          ...{ [propKey]: checkForLabel(propValue) },
        }), {});
    }
  }
  return newValue;
};
