import Vue from 'vue';
// eslint-disable-next-line
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

export const metaDescription = (data, currentLang) => {
  const content = [];
  const maxCharacters = 170;
  let text = '';

  // add type
  if (data.type) {
    content.push(data.type.label[currentLang || 'en']);
  }

  // add primary details
  if (data.primary_details) {
    data.primary_details.forEach((elem) => {
      // do not add urls
      if (elem.label === 'URL') {
        return;
      }

      const group = [];
      // eslint-disable-next-line no-use-before-define
      group.push(toTitleString(elem.label));

      // data: string
      if (elem.data && typeof elem.data === 'string') {
        group.push(elem.data);
      }

      // data: array of strings
      if (elem.data && typeof elem.data === 'object' && typeof elem.data[0] === 'string') {
        group.push(elem.data.join(', '));
      }

      // data: array of objects
      if (elem.data && typeof elem.data === 'object' && typeof elem.data[0] === 'object') {
        group.push(elem.data.map((item) => item.value).join(', '));
      }

      // colon separated string
      content.push(group.join(': '));
    });
  }

  // semicolon separated string
  text = content.join('; ');

  /**
   * TODO:
   * - if after joining primary_details still characters left, add contributors
   * - entity person: add secondary_details
   */

  return text.length < maxCharacters
    ? text
    : `${text.substr(0, maxCharacters - 1)}\u2026`;
};

export const toTitleString = (string = '', language) => {
  if (!string) {
    return '';
  }
  const functionLang = language || i18n.locale || 'en';
  const sentenceIndicators = /[.!?:]$/;
  const enTitleCasing = process.env.EN_TITLE_CASING || process.env.enTitleCasing;
  if (enTitleCasing && functionLang === 'en'
    && typeof string === 'string'
    && string.search(sentenceIndicators) < 0) {
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
 * @param {Object|Object[]} value - the value object to check - in order for a title casing
 * to be applied the object needs to contain the following structure:
 *  {
 *    label: 'Label to title case'),
 *  },
 *  could also be several objects wrapped in an array
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

/**
 * function to determine if an variable (no matter if number, string, object or array) has data
 * thus an empty array or an object without any values would return false
 * @param {number|string|Object|Array} fieldValues - the variable to evaluate
 * @returns {boolean} - result of evaluation if variable has data
 */
export const hasData = (fieldValues) => {
  let hasContent = false;
  if (fieldValues && typeof fieldValues === 'object') {
    if (fieldValues.length >= 0) {
      fieldValues.forEach((values) => { hasContent = hasData(values) || hasContent; });
    } else {
      const objectKeys = Object.keys(fieldValues);
      objectKeys
        .forEach((key) => { hasContent = hasData(fieldValues[key]) || hasContent; });
    }
  } else {
    hasContent = fieldValues === 0 || !!fieldValues || hasContent;
  }
  return hasContent;
};

/**
 * function to walk through object array and title case values with key 'label'
 *
 * @param {Array} data - data array
 * @returns {Array} - modified data array
 */
export const titleCaseLabels = (data) => {
  if (data) {
    return Object.values(
      Object.entries(data)
        .reduce((prev, [key, value]) => {
          const newVal = checkForLabel(value);
          return { ...prev, ...{ [key]: newVal } };
        }, {}),
    );
  }
  return [];
};

/**
 * function to
 * a) check if provided value is a language object and if yes
 * b) get the correct label from an object with language (ISO 639-1) as property
 *    (e.g. { de: 'yyy', en: 'xxx' })
 * @param {string|Object} value - the string or object to be processed
 * @param {string} language - the language used (that is the object property)
 * @param {boolean} useAny - specify if a label in a different language should be used
 *  if the currently set language has no result
 * @returns {Object|string}
 */
export const getLangLabel = (value, language, useAny = false) => {
  if (typeof value === 'string') return value;
  if (value && language && value[language]) {
    return value[language];
  }
  if (value && language && useAny) {
    const availableLang = Object.keys(value).find((key) => !!value[key]);
    // return the first one that has content
    return value[availableLang] || value[language] || '';
  }
  return value;
};
