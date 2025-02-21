import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';
import { UserRoles } from '@libs/entities-lib/user';

const ApprovalsLayout = () => import('@/ui/views/pages/approvals/layout/ApprovalsLayout.vue');
const ApprovalsTemplates = () => import('@/ui/views/pages/approvals/templates/ApprovalsTemplates.vue');
const ApprovalRequestsHome = () => import('@/ui/views/pages/approvals/requests/ApprovalRequestsHome.vue');
const ApprovalsTemplatesCreateEdit = () => import('@/ui/views/pages/approvals/create-edit/CreateEditApprovals.vue');

export const approvals: RouteConfig = {
  path: Routes.approvals.layout.path,
  component: ApprovalsLayout,
  meta: {
    requiresAuthorization: true,
  },
  children: [
    {
      path: Routes.approvals.templates.home.path,
      name: Routes.approvals.templates.home.name,
      component: ApprovalsTemplates,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.approvals.templates.create.path,
      name: Routes.approvals.templates.create.name,
      component: ApprovalsTemplatesCreateEdit,
      meta: { roles: [UserRoles.level6] },
    },
    {
      path: Routes.approvals.request.path,
      name: Routes.approvals.request.name,
      component: ApprovalRequestsHome,
      meta: { roles: [UserRoles.level3, UserRoles.level4] },
    },
  ],
};
