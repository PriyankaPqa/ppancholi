import { RouteConfig } from 'vue-router';
import Routes from '@/constants/routes';

const Home = () => import('@/ui/views/pages/reporting/ReportingHome.vue');

export const reporting: Array<RouteConfig> = [
  {
    path: Routes.reporting.home.path,
    name: Routes.reporting.home.name,
    component: Home,
    props: true,
    meta: {
      requiresAuthentication: true,
    },
  },
];
