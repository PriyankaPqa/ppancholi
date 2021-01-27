import { RouteConfig } from 'vue-router';
import { Trans } from '@/ui/plugins';
import Routes from '@/constants/routes';

const MainLayout = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/components/layout/MainLayout.vue');

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
        path: Routes.home.path,
        name: Routes.home.name,
        component: MainLayout,
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
