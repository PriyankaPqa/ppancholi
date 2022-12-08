import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';

const FinancialAssistanceLayout = () => import('@/ui/views/pages/financial-assistance/layout/FinancialAssistanceLayout.vue');
const FinancialAssistanceHome = () => import('@/ui/views/pages/financial-assistance/home/FinancialAssistanceHome.vue');

export const financialAssistance: RouteConfig = {
  path: Routes.financialAssistance.layout.path,
  component: FinancialAssistanceLayout,
  meta: {
    requiresAuthorization: true,
  },
  children: [
    {
      path: Routes.financialAssistance.home.path,
      name: Routes.financialAssistance.home.name,
      component: FinancialAssistanceHome,
      meta: { level: 'level6' },
    },
  ],
};
