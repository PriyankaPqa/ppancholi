import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';
import { UserRoles } from '@libs/entities-lib/user';

const AppointmentsLayout = () => import('@/ui/views/pages/appointments/layout/AppointmentsLayout.vue');
const AppointmentsHome = () => import('@/ui/views/pages/appointments/home/AppointmentsHome.vue');

export const appointments: RouteConfig = {
  path: Routes.appointments.layout.path,
  component: AppointmentsLayout,
  meta: {
    requiresAuthorization: true,
  },
  children: [
    {
      path: Routes.appointments.home.path,
      name: Routes.appointments.home.name,
      component: AppointmentsHome,
      meta: { level: UserRoles.level6 },
    },
  ],
};
