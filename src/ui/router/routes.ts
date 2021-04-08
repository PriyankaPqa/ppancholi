import { RouteConfig } from 'vue-router';
import { Trans } from '@/ui/plugins';
import Routes from '@/constants/routes';

const MainLayout = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/components/layout/MainLayout.vue');
const LandingPage = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/pages/registration/landing-page/LandingPage.vue');
const Individual = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/pages/registration/individual/Individual.vue');

const PageNotFound = () => import(/* webpackChunkName: "not-found" */ '@/ui/views/pages/page-not-found/PageNotFound.vue');

export const routes: Array<RouteConfig> = [
  {
    path: '/:lang',
    name: '',
    component: {
      render(c) {
        return c('router-view');
      },
    },
    beforeEnter: Trans.routeMiddleware,
    children: [
      {
        path: Routes.registration.path,
        component: MainLayout,
        children: [
          {
            path: '',
            name: Routes.registration.name,
            redirect: { name: Routes.landingPage.name },
          },
          {
            path: Routes.landingPage.path,
            name: Routes.landingPage.name,
            component: LandingPage,
          },
          {
            path: Routes.individual.path,
            name: Routes.individual.name,
            component: Individual,
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
