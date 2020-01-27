// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import Router from 'vue-router';
import i18n from './plugins/i18n';

import Discover from '~/views/discover';
import ObjectView from '~/views/ObjectView';
import PersonView from '~/views/PersonView';

Vue.use(Router);

// eslint-disable-next-line import/prefer-default-export
export function createRouter() {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: Discover,
      },
      {
        path: '/:lang([a-z]{2})',
        async beforeEnter(to, from, next) {
          const { lang } = to.params;
          const path = to.path.replace(/^\/[a-z]{2}/, '');
          i18n.locale = lang;
          return next(path);
        },
        children: [
          {
            path: '',
            component: Discover,
          },
          {
            path: ':id(\\w+\\.\\w+\\d*)',
            name: 'PersonLang',
            component: PersonView,
          },
          {
            path: ':id/:slug?',
            name: 'ObjectLang',
            component: ObjectView,
          },
        ],
      },
      {
        path: '/:id(\\w+\\.\\w+\\d*)',
        name: 'Person',
        component: PersonView,
      },
      {
        path: '/:id/:slug?',
        name: 'Object',
        component: ObjectView,
      },
    ],
  });
}
