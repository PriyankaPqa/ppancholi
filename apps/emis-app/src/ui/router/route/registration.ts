import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';

const RegistrationLayout = () => import('@/ui/views/pages/registration/layout/RegistrationLayout.vue');
const RegistrationHome = () => import('@/ui/views/pages/registration/home/RegistrationHome.vue');
const RegistrationIndividual = () => import('@/ui/views/pages/registration/individual/RegistrationIndividual.vue');

export const registration: RouteConfig = {
  path: Routes.registration.layout.path,
  component: RegistrationLayout,
  meta: {
    requiresAuthorization: true,
  },
  children: [
    {
      path: Routes.registration.home.path,
      name: Routes.registration.home.name,
      component: RegistrationHome,
      meta: { level: 'level1' },
    },
    {
      path: Routes.registration.individual.path,
      name: Routes.registration.individual.name,
      component: RegistrationIndividual,
      meta: { level: 'level1' },
    },
  ],
};
