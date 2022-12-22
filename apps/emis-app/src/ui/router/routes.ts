/* eslint-disable max-len, vue/max-len */

import { RouteConfig } from 'vue-router';
import { Trans } from '@/ui/plugins/translation';
import store from '@/store/store';
import helpers from '@/ui/helpers/helpers';
import {
  USER_ACCOUNT_ENTITIES,
} from '@/constants/vuex-modules';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { events } from '@/ui/router/route/events';
import { caseFiles } from '@/ui/router/route/caseFiles';
import { approvals } from '@/ui/router/route/approvals';
import { massActions } from '@/ui/router/route/massActions';
import { systemManagement } from '@/ui/router/route/systemManagement';
import { financialAssistance } from '@/ui/router/route/financialAssistance';
import { registration } from '@/ui/router/route/registration';
import { teams } from '@/ui/router/route/teams';
import { assessmentTemplates } from '@/ui/router/route/assessmentTemplates';
import { useDashboardStore } from '@/pinia/dashboard/dashboard';
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
        const userAccount = await store.dispatch(`${USER_ACCOUNT_ENTITIES}/fetchCurrentUserAccount`);
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
          level: 'level6', feature: FeatureKeys.Assessments, requiresAuthentication: true, requiresAuthorization: true,
        },
        props: true,
      },
      {
        path: Routes.events.assessments.builder.path,
        name: Routes.events.assessments.builder.name,
        component: AssessmentBuilder,
        meta: {
          level: 'level6', feature: FeatureKeys.Assessments, requiresAuthentication: true, requiresAuthorization: true,
        },
        props: true,
      },
      {
        path: Routes.assessmentTemplates.runner.path,
        name: Routes.assessmentTemplates.runner.name,
        component: AssessmentRunner,
        meta: {
          level: 'level6', feature: FeatureKeys.Assessments, requiresAuthentication: true, requiresAuthorization: true,
        },
        props: true,
      },
      {
        path: Routes.events.assessments.runner.path,
        name: Routes.events.assessments.runner.name,
        component: AssessmentRunner,
        meta: {
          level: 'level6', feature: FeatureKeys.Assessments, requiresAuthentication: true, requiresAuthorization: true,
        },
        props: true,
      },
      {
        path: Routes.events.assessments.complete.path,
        name: Routes.events.assessments.complete.name,
        component: AssessmentRunner,
        meta: {
          level: 'level1', feature: FeatureKeys.Assessments, requiresAuthentication: true, requiresAuthorization: true,
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
              level: 'level1',
              roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'],
              requiresAuthorization: false,
            },
          },
          approvals,
          ...assessmentTemplates,
          caseFiles,
          {
            path: Routes.householdSearch.path,
            name: Routes.householdSearch.name,
            component: MainHouseholdSearch,
            meta: { level: 'level1' },
            props: true,
          },
          registration,
          events,
          financialAssistance,
          massActions,
          systemManagement,
          teams,
          {
            path: Routes.accountSettings.home.path,
            name: Routes.accountSettings.home.name,
            component: AccountSettings,
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
