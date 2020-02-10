// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import Router from 'vue-router';

import Discover from '~/views/discover';
import ObjectView from '~/views/ObjectView';
import PersonView from '~/views/PersonView';

Vue.use(Router);

// eslint-disable-next-line import/prefer-default-export
export function createRouter() {
  return new Router({
    mode: 'history',
    base: process.env.appPrefix,
    routes: [
      {
        path: '/',
        component: Discover,
      },
      {
        path: '/:lang([a-z]{2})',
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
