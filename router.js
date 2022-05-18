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
    scrollBehavior(to, from, savedPosition) {
      // use a promise to delay the scrolling until page transition has finished
      return new Promise((resolve) => {
        setTimeout(() => {
          // check if saved position was provided (=this will only be the case if
          // popstate event was triggered)
          if (savedPosition) {
            resolve(savedPosition);
          } else {
            // else return to page top
            resolve({ x: 0, y: 0 });
          }
          // if it should be scrolled to a certain place delay the scroll
          // to give page a chance to render completely first
        }, savedPosition ? 500 : 250);
      });
    },
  });
}
