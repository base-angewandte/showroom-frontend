// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import Router from 'vue-router';

import Discover from '~/views/Discover';
import ActivityView from '~/views/ActivityView';
import EntityView from '~/views/EntityView';

Vue.use(Router);

// eslint-disable-next-line import/prefer-default-export
export function createRouter() {
  return new Router({
    mode: 'history',
    base: `${process.env.appPrefix}/`,
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
            path: ':id(\\w-]+-[\\w]+)',
            name: 'PersonLang',
            component: EntityView,
          },
          {
            path: ':id/:slug?',
            name: 'ObjectLang',
            component: ActivityView,
          },
        ],
      },
      {
        path: '/:id([\\w-]+-[\\w]+)',
        name: 'Person',
        component: EntityView,
      },
      {
        path: '/:id/:slug?',
        name: 'Object',
        component: ActivityView,
      },
    ],
  });
}
