/* eslint-disable max-len, vue/max-len */
import { RouteConfig } from 'vue-router';
import { Trans } from '@/ui/plugins/translation';
import helpers from '@/ui/helpers/helpers';
import { events } from '@/ui/router/route/events';
import { caseFiles } from '@/ui/router/route/caseFiles';
import { approvals } from '@/ui/router/route/approvals';
import { massActions } from '@/ui/router/route/massActions';
import { reporting } from '@/ui/router/route/reporting';
import { systemManagement } from '@/ui/router/route/systemManagement';
import { financialAssistance } from '@/ui/router/route/financialAssistance';
import { registration } from '@/ui/router/route/registration';
import { teams } from '@/ui/router/route/teams';
import { assessmentTemplates } from '@/ui/router/route/assessmentTemplates';
import { appointments } from '@/ui/router/route/appointments';
import { useDashboardStore } from '@/pinia/dashboard/dashboard';
import { useUserAccountStore } from '@/pinia/user-account/user-account';
import { UserRoles } from '@libs/entities-lib/user';
import Routes from '../../constants/routes';
import { SignalR } from '../plugins/signal-r/signalR';

// /* ADD ROUTES FOR DASHBOARD HERE */
const AssessmentBuilder = () => import('@/ui/views/pages/assessment-templates/details/AssessmentBuilder.vue');
const AssessmentRunner = () => import('@/ui/views/pages/assessment-templates/details/AssessmentRunner.vue');

const MainLayout = () => import('@/ui/views/components/layout/MainLayout.vue');
const HomeLayout = () => import('@/ui/views/pages/home/layout/HomeLayout.vue');

const PageNotFound = () => import('@/ui/views/pages/page-not-found/PageNotFound.vue');
const LoginError = () => import('@/ui/views/pages/login-error/LoginError.vue');

const MainHouseholdSearch = () => import('@/ui/views/pages/household/search/MainHouseholdSearch.vue');

const AccountSettings = () => import('@/ui/views/pages/system-management/lists/user-accounts/account-settings/AccountSettings.vue');

const MainTasksTable = () => import('@/ui/views/pages/case-files/details/case-file-task/TasksTable.vue');

// NOTE: Be aware of the importance of routes order. Details pages have the route pattern 'entityName/:entityId'
// and create pages have the route pattern 'entityName/add'. Therefore, the create pages for an entity need to place before the details pages,
// otherwise when loading the page the router will first try to go to the details page,
// which matches the same pattern, and consider the string "add" as the entityId parameter.

export const routes: Array<RouteConfig> = [
  {
    path: '/:lang',
    name: '',
    component: {
      render(c) {
        return c('router-view');
      },
    },
    beforeEnter: async (to, from, next) => {
      const dashboardStore = useDashboardStore();
      dashboardStore.checkingAccount = false;
      if (to.name !== Routes.loginError.name) {
        dashboardStore.initLoading = true;
        const userAccount = await useUserAccountStore().fetchCurrentUserAccount();
        if (userAccount) {
          await SignalR.instance.buildHubConnection();
        } else {
          helpers.redirectToLoginErrorPage();
        }
      }
      dashboardStore.initLoading = false;
      Trans.routeMiddleware(to, from, next);
    },
    children: [
      {
        path: Routes.assessmentTemplates.builder.path,
        name: Routes.assessmentTemplates.builder.name,
        component: AssessmentBuilder,
        meta: {
          level: UserRoles.level6, requiresAuthentication: true, requiresAuthorization: true,
        },
        props: true,
      },
      {
        path: Routes.events.assessments.builder.path,
        name: Routes.events.assessments.builder.name,
        component: AssessmentBuilder,
        meta: {
          level: UserRoles.level6, requiresAuthentication: true, requiresAuthorization: true,
        },
        props: true,
      },
      {
        path: Routes.assessmentTemplates.runner.path,
        name: Routes.assessmentTemplates.runner.name,
        component: AssessmentRunner,
        meta: {
          level: UserRoles.level6, requiresAuthentication: true, requiresAuthorization: true,
        },
        props: true,
      },
      {
        path: Routes.events.assessments.runner.path,
        name: Routes.events.assessments.runner.name,
        component: AssessmentRunner,
        meta: {
          level: UserRoles.level6, requiresAuthentication: true, requiresAuthorization: true,
        },
        props: true,
      },
      {
        path: Routes.events.assessments.complete.path,
        name: Routes.events.assessments.complete.name,
        component: AssessmentRunner,
        meta: {
          level: UserRoles.level0, requiresAuthentication: true, requiresAuthorization: true,
        },
        props: true,
      },
      {
        path: '',
        redirect: { name: Routes.home.name },
      },
      {
        path: '',
        component: MainLayout,
        meta: {
          requiresAuthentication: true,
        },
        children: [
          {
            path: Routes.home.path,
            name: Routes.home.name,
            component: HomeLayout,
            meta: {
              level: UserRoles.level1,
              roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly],
              requiresAuthorization: false,
            },
          },
          ...reporting,
          approvals,
          ...assessmentTemplates,
          caseFiles,
          {
            path: Routes.householdSearch.path,
            name: Routes.householdSearch.name,
            component: MainHouseholdSearch,
            meta: { level: UserRoles.level1 },
            props: true,
          },
          registration,
          events,
          financialAssistance,
          massActions,
          systemManagement,
          teams,
          appointments,
          {
            path: Routes.accountSettings.home.path,
            name: Routes.accountSettings.home.name,
            component: AccountSettings,
          },
          {
            path: Routes.tasks.home.path,
            name: Routes.tasks.home.name,
            component: MainTasksTable,
          },
        ],
      },
      {
        path: Routes.loginError.path,
        name: Routes.loginError.name,
        component: LoginError,
        props: true,
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
