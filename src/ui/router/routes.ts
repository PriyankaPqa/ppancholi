import { RouteConfig } from 'vue-router';
/* eslint-disable max-len */

import { Trans } from '@/ui/plugins/translation';
import Routes from '../../constants/routes';

// /* ADD ROUTES FOR DASHBOARD HERE */

const AssessmentsLayout = () => import(/* webpackChunkName: "assessments" */ '@/ui/views/pages/assessments/layout/AssessmentsLayout.vue');
const AssessmentsHome = () => import(/* webpackChunkName: "assessments" */ '@/ui/views/pages/assessments/home/AssessmentsHome.vue');

const ApprovalsLayout = () => import(/* webpackChunkName: "approvals" */ '@/ui/views/pages/approvals/layout/ApprovalsLayout.vue');
const ApprovalsHome = () => import(/* webpackChunkName: "approvals" */ '@/ui/views/pages/approvals/home/ApprovalsHome.vue');

const CaseFileLayout = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/layout/CaseFileLayout.vue');
const HomeCaseFile = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/home/CaseFileHome.vue');

const EventsLayout = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/layout/EventsLayout.vue');
const HomeEvents = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/home/EventsHome.vue');
const CreateEditEvent = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/create-edit/CreateEditEvent.vue');

const MainLayout = () => import(/* webpackChunkName: "home" */ '@/ui/views/components/layout/MainLayout.vue');
const HomeLayout = () => import(/* webpackChunkName: "home" */ '@/ui/views/pages/home/layout/HomeLayout.vue');

const FinancialAssistanceLayout = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/pages/financial-assistance/layout/FinancialAssistanceLayout.vue');
const FinancialAssistanceHome = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/pages/financial-assistance/home/FinancialAssistanceHome.vue');

const MassActionsLayout = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/layout/MassActionsLayout.vue');
const MassActionsHome = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/home/MassActionsHome.vue');

const PageNotFound = () => import(/* webpackChunkName: "not-found" */ '@/ui/views/pages/page-not-found/PageNotFound.vue');
const LoginError = () => import(/* webpackChunkName: "login-error" */ '@/ui/views/pages/login-error/LoginError.vue');

const ReportsLayout = () => import(/* webpackChunkName: "reports" */ '@/ui/views/pages/reports/layout/ReportsLayout.vue');
const ReportsHome = () => import(/* webpackChunkName: "reports" */ '@/ui/views/pages/reports/home/ReportsHome.vue');

const SystemManagementLayout = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/layout/SystemManagementLayout.vue');
const SystemManagementHome = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/home/SystemManagementHome.vue');

const TeamsLayout = () => import(/* webpackChunkName: "teams" */ '@/ui/views/pages/teams/layout/TeamsLayout.vue');
const TeamsHome = () => import(/* webpackChunkName: "teams" */ '@/ui/views/pages/teams/home/TeamsHome.vue');

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
        path: '',
        component: MainLayout,
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: Routes.home.path,
            name: Routes.home.name,
            component: HomeLayout,
            meta: { level: 'level1' },
          },
          {
            path: Routes.approvals.layout.path, // approvals
            component: ApprovalsLayout,
            meta: { level: 'level3' },
            children: [
              {
                path: Routes.approvals.home.path,
                name: Routes.approvals.home.name,
                component: ApprovalsHome,
                meta: { level: 'level3' },
              },
            ],
          },
          {
            path: Routes.assessments.layout.path, // assessments
            component: AssessmentsLayout,
            meta: { level: 'level6' },
            children: [
              {
                path: Routes.assessments.home.path,
                name: Routes.assessments.home.name,
                component: AssessmentsHome,
                meta: { level: 'level6' },
              },
            ],
          },
          {
            path: Routes.caseFile.layout.path, // case files
            component: CaseFileLayout,
            meta: { level: 'level1' },
            children: [
              {
                path: Routes.caseFile.home.path,
                name: Routes.caseFile.home.name,
                component: HomeCaseFile,
                meta: { level: 'level1' },
              },
            ],
          },
          {
            path: Routes.events.layout.path, // events
            component: EventsLayout,
            meta: { level: 'level4' },
            children: [
              {
                path: Routes.events.home.path,
                name: Routes.events.home.name,
                component: HomeEvents,
                meta: { level: 'level4' },
              },
              {
                path: Routes.events.create.path,
                name: Routes.events.create.name,
                component: CreateEditEvent,
              },
            ],
          },
          {
            path: Routes.financialAssistance.layout.path, // financial assistance
            component: FinancialAssistanceLayout,
            meta: { level: 'level6' },
            children: [
              {
                path: Routes.financialAssistance.home.path,
                name: Routes.financialAssistance.home.name,
                component: FinancialAssistanceHome,
                meta: { level: 'level6' },
              },
            ],
          },
          {
            path: Routes.massActions.layout.path, // mass actions
            component: MassActionsLayout,
            meta: { level: 'level5' },
            children: [
              {
                path: Routes.massActions.home.path,
                name: Routes.massActions.home.name,
                component: MassActionsHome,
                meta: { level: 'level5' },
              },
            ],
          },
          {
            path: Routes.reports.layout.path, // reports
            component: ReportsLayout,
            meta: { level: 'level5' },
            children: [
              {
                path: Routes.reports.home.path,
                name: Routes.reports.home.name,
                component: ReportsHome,
                meta: { level: 'level5' },
              },
            ],
          },
          {
            path: Routes.systemManagement.layout.path, // system management
            component: SystemManagementLayout,
            meta: { level: 'level6' },
            children: [
              {
                path: Routes.systemManagement.home.path,
                name: Routes.systemManagement.home.name,
                component: SystemManagementHome,
                meta: { level: 'level6' },
              },
            ],
          },
          {
            path: Routes.teams.layout.path, // teams
            component: TeamsLayout,
            meta: { level: 'level3' },
            children: [
              {
                path: Routes.teams.home.path,
                name: Routes.teams.home.name,
                component: TeamsHome,
                meta: { level: 'level3' },
              },
            ],
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
