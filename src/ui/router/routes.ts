import { RouteConfig } from 'vue-router';
/* eslint-disable max-len */

import { Trans } from '@/ui/plugins/translation';
import Routes from '../../constants/routes';

// /* ADD ROUTES FOR DASHBOARD HERE */
const DashboardPortalLayout = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/Dashboard/Layout/DashboardLayout.vue');
const DashboardHome = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/Dashboard/Pages/Home/Layout/HomeLayout.vue');

const PageNotFound = () => import(/* webpackChunkName: "not-found" */ '@/ui/views/PageNotFound.vue');

export const routes: Array<RouteConfig> = [
  {
    path: '/:lang',
    name: '',
    component: {
      render(c) { return c('router-view'); },
    },
    beforeEnter: Trans.routeMiddleware,
    children: [
      {
        path: '',
        redirect: { name: Routes.dashboard.name },
      },
      {
        path: Routes.dashboard.path,
        component: DashboardPortalLayout,
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: '',
            name: Routes.dashboard.name,
            component: DashboardHome,
          },
        ],
      },
      {
        path: '*',
        name: 'PageNotFound',
        component: PageNotFound,
      },
    ],
  },
  {
    // Redirect user to supported lang version.
    path: '*',
    redirect() {
      return Trans.getUserSupportedLang();
    },
  },
];
