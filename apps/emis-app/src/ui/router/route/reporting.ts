import { RouteConfig } from 'vue-router';
import Routes from '@/constants/routes';
import { UserRoles } from '@libs/entities-lib/user';

const Home = () => import('@/ui/views/pages/reporting/ReportingHome.vue');
const ReportingMenus = () => import('@/ui/views/pages/reporting/ReportingMenus.vue');
const QueriesList = () => import('@/ui/views/pages/reporting/QueriesList.vue');
const QueryView = () => import('@/ui/views/pages/reporting/QueryView.vue');

export const reporting: Array<RouteConfig> = [
  {
    path: Routes.reporting.home.path,
    name: Routes.reporting.home.name,
    component: Home,
    props: true,
    meta: { level: UserRoles.level6 },
  },
  {
    path: Routes.reporting.menu.path,
    name: Routes.reporting.menu.name,
    component: ReportingMenus,
    props: true,
    meta: { level: UserRoles.level6 },
    children: [
      {
        path: Routes.reporting.list.path,
        name: Routes.reporting.list.name,
        component: QueriesList,
        props: true,
        meta: { level: UserRoles.level6 },
      },
    ],
  },
  {
    path: Routes.reporting.query.path,
    name: Routes.reporting.query.name,
    component: QueryView,
    props: true,
    meta: { level: UserRoles.level6 },
  },
  {
    path: Routes.reporting.newQuery.path,
    name: Routes.reporting.newQuery.name,
    component: QueryView,
    props: true,
    meta: { level: UserRoles.level6 },
  },
];
