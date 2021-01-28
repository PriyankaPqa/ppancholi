import { RouteConfig } from 'vue-router';
/* eslint-disable max-len */

import { Trans } from '@/ui/plugins/translation';
import Routes from '../../constants/routes';

// /* ADD ROUTES FOR DASHBOARD HERE */

const CaseFileLayout = () => import(/* webpackChunkName: "casefile" */ '@/ui/views/pages/case-files/layout/CaseFileLayout.vue');
const HomeCaseFile = () => import(/* webpackChunkName: "casefile" */ '@/ui/views/pages/case-files/home/CaseFileHome.vue');

const MainLayout = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/components/layout/MainLayout.vue');
const HomeLayout = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/pages/home/layout/HomeLayout.vue');

const EventsLayout = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/layout/EventsLayout.vue');
const HomeEvents = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/home/EventsHome.vue');
const CreateEditEvent = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/create-edit/CreateEditEvent.vue');

const PageNotFound = () => import(/* webpackChunkName: "not-found" */ '@/ui/views/pages/page-not-found/PageNotFound.vue');
const LoginError = () => import(/* webpackChunkName: "login-error" */ '@/ui/views/pages/login-error/LoginError.vue');

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
        redirect: { name: Routes.home.name },
      },
      {
        path: '',
        component: MainLayout,
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: Routes.home.path,
            name: Routes.home.name,
            component: HomeLayout,
            meta: { level: 'level1' },
          },
          {
            path: Routes.events.layout.path, // events
            component: EventsLayout,
            children: [
              {
                path: Routes.events.home.path,
                name: Routes.events.home.name,
                component: HomeEvents,
              },
              {
                path: Routes.events.create.path,
                name: Routes.events.create.name,
                component: CreateEditEvent,
              },
            ],
          },
          {
            path: Routes.caseFile.layout.path, // case files
            component: CaseFileLayout,
            meta: { level: 'level1' },
            children: [
              {
                path: Routes.caseFile.home.path,
                name: Routes.caseFile.home.name,
                component: HomeCaseFile,
                meta: { level: 'level1' },
              },
            ],
          },
        ],
      },
      {
        path: Routes.loginError.path,
        name: Routes.loginError.name,
        component: LoginError,
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
