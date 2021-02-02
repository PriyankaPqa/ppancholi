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

const RegistrationLayout = () => import(/* webpackChunkName: "registration" */ '@/ui/views/pages/registration/layout/RegistrationLayout.vue');
const RegistrationHome = () => import(/* webpackChunkName: "registration" */ '@/ui/views/pages/registration/home/RegistrationHome.vue');

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
            meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3'] },
          },
          {
            path: Routes.approvals.layout.path, // approvals
            component: ApprovalsLayout,
            children: [
              {
                path: Routes.approvals.home.path,
                name: Routes.approvals.home.name,
                component: ApprovalsHome,
                meta: { roles: ['level3', 'level4', 'level6'] },
              },
            ],
          },
          {
            path: Routes.assessments.layout.path, // assessments
            component: AssessmentsLayout,
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
            children: [
              {
                path: Routes.caseFile.home.path,
                name: Routes.caseFile.home.name,
                component: HomeCaseFile,
                meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3'] },
              },
            ],
          },
          {
            path: Routes.registration.layout.path, // registration
            component: RegistrationLayout,
            children: [
              {
                path: Routes.registration.home.path,
                name: Routes.registration.home.name,
                component: RegistrationHome,
                meta: { level: 'level1' },
              },
            ],
          },
          {
            path: Routes.events.layout.path, // events
            component: EventsLayout,
            children: [
              {
                path: Routes.events.home.path,
                name: Routes.events.home.name,
                component: HomeEvents,
                meta: { level: 'level4', roles: ['contributorIM'] },
              },
              {
                path: Routes.events.create.path,
                name: Routes.events.create.name,
                component: CreateEditEvent,
                meta: { level: 'level6' },
              },
            ],
          },
          {
            path: Routes.financialAssistance.layout.path, // financial assistance
            component: FinancialAssistanceLayout,
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
            children: [
              {
                path: Routes.reports.home.path,
                name: Routes.reports.home.name,
                component: ReportsHome,
                meta: { level: 'level5', roles: ['contributorIM', 'contributorFinance'] },
              },
            ],
          },
          {
            path: Routes.systemManagement.layout.path, // system management
            component: SystemManagementLayout,
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
