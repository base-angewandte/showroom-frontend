import { toTitleString } from '~/utils/common';

/**
 * generate generic meta tag
 * @param {String} hid - unique
 * @param {String} content - content to add
 * @param {Boolean} property - use attribute property instead of name
 * @returns {{hid, content}}
 */
export const metaTag = (hid, content, property = false) => {
  const obj = {
    hid,
    content,
  };

  if (!property) {
    obj.name = hid;
  }

  if (property) {
    obj.property = hid;
  }

  return obj;
};

/**
 * generate rel alternate and canonical tags
 * consider all languages defined in env.locales
 *
 * @param {String} routerPath - current routerPath
 * @param {String} currentLang - current language
 * @returns {Array}
 */
export const metaRelAlternate = (routerPath, currentLang) => {
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

/**
 * generate title string
 *
 * @param {Object} data - entry data object
 * @returns {String} - entry title
 */
export const metaTitle = (data) => `${data.title} ${data.subtext && data.subtext.length ? ` - ${data.subtext.join(', ')} ` : ''}| ${process.env.appTitle}`;

/**
 * generate meta description string
 * content mainly from primary_details
 *
 * @param {Object} data - entry data object
 * @param {String} currentLang - current language
 * @returns {String} - semi-colon separated string
 */
export const metaDescription = (data, currentLang) => {
  const content = [];
  const maxCharacters = 170;
  let text = '';

  // add type of activity
  if (data.type && data.type.label) {
    content.push(data.type.label[currentLang || 'en']);
  }

  // add expertise
  if (data.expertise) {
    // TODO: add translation for label 'Expertise'
    content.push(`Expertise: ${data.expertise.join(', ')}`);
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
      group.push(toTitleString(elem.label[currentLang] || elem.label), currentLang);

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
   * - entity person: prioritise secondary_details if defined
   */
  return text.length < maxCharacters
    ? text
    : `${text.substr(0, maxCharacters - 1)}\u2026`;
};

/**
 * generate meta image tags
 * currently supported: featured_media
 * Todo: maybe all media formats (image, video, audio) in media assets should be considered
 *
 * @param {Object} data - entry data object
 * @returns {Array} - array with media related meta tag objects
 */
export const metaImages = (data) => {
  const images = [];
  if (data.featured_media
    && data.featured_media.previews
    && data.featured_media.previews.length) {
    // get media object
    const obj = data.featured_media;
    // get last/largest preview image object
    const image = obj.previews.slice(-1)[0];
    // get key/width of the image
    const key = Object.keys(image);
    // get key of the image
    const url = image[key];
    // get with of image
    const width = parseInt(key, 10);
    // define related meta image tag objects
    images.push(metaTag('og:image', url, true));
    images.push(metaTag('og:image:type', obj.mime_type, true));
    images.push(metaTag('og:image:width', width, true));
  }
  return images;
};

/**
 * generate meta tags
 * currently supported: description, og:title, og:description, og:url, og:image
 *
 * @param {Object} data - entry data object
 * @param {String} currentLang - current language
 * @param {String} routerPath - current router path
 * @returns {Array} - array with  meta tag objects
 */
export const meta = (data, currentLang, routerPath) => {
  let tags = [];
  tags.push(metaTag('description', metaDescription(data, currentLang)));
  tags.push(metaTag('og:title', metaTitle(data), true));
  tags.push(metaTag('og:description', metaDescription(data, currentLang), true));
  tags.push(metaTag('og:url', `${process.env.appBaseUrl}${process.env.appPrefix}/${currentLang}${routerPath}`, true));
  // og:image
  if (metaImages(data)) {
    tags = tags.concat(metaImages(data));
  }
  // Todo: consider og:video, og:audio
  return tags;
};
