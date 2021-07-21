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
