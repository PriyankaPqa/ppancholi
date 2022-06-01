/* eslint-disable max-len */

import { RouteConfig } from 'vue-router';
import { Trans } from '@/ui/plugins/translation';
import store from '@/store/store';
import helpers from '@/ui/helpers/helpers';
import {
  USER_ACCOUNT_ENTITIES, DASHBOARD_MODULE, TENANT_SETTINGS_ENTITIES,
} from '@/constants/vuex-modules';
import { FeatureKeys } from '@/entities/tenantSettings';
import Routes from '../../constants/routes';
import { SignalR } from '../plugins/signal-r/signalR';

// /* ADD ROUTES FOR DASHBOARD HERE */
const AssessmentsLayout = () => import(/* webpackChunkName: "assessments" */ '@/ui/views/pages/assessments/layout/AssessmentsLayout.vue');
const AssessmentsHome = () => import(/* webpackChunkName: "assessments" */ '@/ui/views/pages/assessments/home/AssessmentsHome.vue');

const ApprovalsLayout = () => import(/* webpackChunkName: "approvals" */ '@/ui/views/pages/approvals/layout/ApprovalsLayout.vue');
const ApprovalsTemplates = () => import(/* webpackChunkName: "approvals" */ '@/ui/views/pages/approvals/templates/ApprovalsTemplates.vue');
const ApprovalsRequest = () => import(/* webpackChunkName: "approvals" */ '@/ui/views/pages/approvals/requests/ApprovalsRequest.vue');

const CaseFileLayout = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/layout/CaseFileLayout.vue');
const HomeCaseFile = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/home/CaseFileHome.vue');
const CaseFileDetails = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/CaseFileDetails.vue');
const CaseFileActivity = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-activity/CaseFileActivity.vue');
const FinancialAssistancePaymentsList = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-financial-assistance/FinancialAssistancePaymentsList.vue');
const CreateEditCaseFileFinancialAssistance = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-financial-assistance/components/CreateEditFinancialAssistance.vue');
const ViewPaymentLineDetails = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-financial-assistance/components/ViewPaymentLineDetails.vue');
const CaseNote = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-note/CaseNote.vue');
const CaseFileReferral = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-referral/CaseFileReferral.vue');
const CaseFileReferralDetails = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-referral/components/CaseFileReferralDetails.vue');
const CreateEditCaseFileReferral = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-referral/components/CreateEditReferral.vue');
const CaseFileDocument = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-document/CaseFileDocument.vue');
const CreateEditCaseFileDocument = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-document/components/CreateEditCaseFileDocument.vue');
const CaseFileDocumentDetails = () => import(/* webpackChunkName: "case-file" */ '@/ui/views/pages/case-files/details/case-file-document/components/CaseFileDocumentDetails.vue');

const EventsLayout = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/layout/EventsLayout.vue');
const HomeEvents = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/home/EventsHome.vue');
const CreateEditEvent = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/create-edit/CreateEditEvent.vue');
const EventDetails = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/details/EventDetails.vue');
const EventSummary = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/events/details/EventSummary.vue');
const ProgramsHome = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/programs/home/ProgramsHome.vue');
const CreateEditProgram = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/programs/create-edit/CreateEditProgram.vue');
const ProgramDetails = () => import(/* webpackChunkName: "event" */ '@/ui/views/pages/programs/details/ProgramDetails.vue');

const MainLayout = () => import(/* webpackChunkName: "home" */ '@/ui/views/components/layout/MainLayout.vue');
const HomeLayout = () => import(/* webpackChunkName: "home" */ '@/ui/views/pages/home/layout/HomeLayout.vue');

const HouseholdProfile = () => import(/* webpackChunkName: "household" */ '@/ui/views/pages/household/HouseholdProfile.vue');
const SplitHousehold = () => import(/* webpackChunkName: "household" */ '@/ui/views/pages/household/split/SplitHousehold.vue');
const MoveHouseholdMembers = () => import(/* webpackChunkName: "household" */ '@/ui/views/pages/household/move/MoveHouseholdMembers.vue');
const MainHouseholdSearch = () => import(/* webpackChunkName: "household" */ '@/ui/views/pages/household/search/MainHouseholdSearch.vue');

const FinancialAssistanceLayout = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/pages/financial-assistance/layout/FinancialAssistanceLayout.vue');
const FinancialAssistanceHome = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/pages/financial-assistance/home/FinancialAssistanceHome.vue');
const EventFinancialAssistanceHome = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/pages/events/details/components/EventFinancialAssistanceHome.vue');
const CreateEditFinancialAssistance = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/pages/financial-assistance/create-edit/CreateEditFinancialAssistance.vue');
const FinancialAssistanceDetails = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/pages/financial-assistance/FinancialAssistanceDetails.vue');

const MassActionsLayout = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/layout/MassActionsLayout.vue');
const MassActionsHome = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/home/MassActionsHome.vue');

const MassActionsFinancialAssistanceHome = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistanceHome.vue');
const FinancialAssistanceCreate = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistanceCreate.vue');
const MassActionsFinancialAssistanceDetails = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistanceDetails.vue');

const MassActionsImportValidationStatusHome = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusHome.vue');
const MassActionsImportValidationStatusCreate = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusCreate.vue');
const MassActionsImportValidationStatusDetails = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusDetails.vue');

const MassActionsImportPaymentStatusHome = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/import-payment-status/ImportPaymentStatusHome.vue');
const MassActionsImportPaymentStatusCreate = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/import-payment-status/ImportPaymentStatusCreate.vue');
const MassActionsImportPaymentStatusDetails = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/import-payment-status/ImportPaymentStatusDetails.vue');

const MassActionsImportUsersHome = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/import-users/ImportUsersHome.vue');
const MassActionsImportUsersCreate = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/import-users/ImportUsersCreate.vue');
const MassActionsImportUsersDetails = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/import-users/ImportUsersDetails.vue');

const MassActionsFundingRequestHome = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/funding-request/FundingRequestHome.vue');
const MassActionsFundingRequestCreate = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/funding-request/FundingRequestCreate.vue');
const MassActionsFundingRequestDetails = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/funding-request/FundingRequestDetails.vue');

const MassActionsDataCorrectionHome = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/data-correction/DataCorrectionHome.vue');
const MassActionsDataCorrectionCreate = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/data-correction/DataCorrectionCreate.vue');
const MassActionsDataCorrectionDetails = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/pages/mass-actions/data-correction/DataCorrectionDetails.vue');

const PageNotFound = () => import(/* webpackChunkName: "not-found" */ '@/ui/views/pages/page-not-found/PageNotFound.vue');
const LoginError = () => import(/* webpackChunkName: "login-error" */ '@/ui/views/pages/login-error/LoginError.vue');

const RegistrationLayout = () => import(/* webpackChunkName: "registration" */ '@/ui/views/pages/registration/layout/RegistrationLayout.vue');
const RegistrationHome = () => import(/* webpackChunkName: "registration" */ '@/ui/views/pages/registration/home/RegistrationHome.vue');
const RegistrationIndividual = () => import(/* webpackChunkName: "registration" */ '@/ui/views/pages/registration/individual/RegistrationIndividual.vue');
const ConfirmationPrint = () => import(/* webpackChunkName: "registration" */ '@/ui/views/pages/registration/confirmation/ConfirmationPrint.vue');

const SystemManagementLayout = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/layout/SystemManagementLayout.vue');
const SystemManagementHome = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/home/SystemManagementHome.vue');
const SystemManagementLists = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/SystemManagementLists.vue');
const CaseFileTags = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/CaseFileTags.vue');
const EventTypes = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/EventTypes.vue');
const Genders = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/Genders.vue');
const PreferredLanguages = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/PreferredLanguages.vue');
const PrimarySpokenLanguages = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/PrimarySpokenLanguages.vue');
const AgreementTypes = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/AgreementTypes.vue');
const CaseFileInactiveReasons = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/CaseFileInactiveReasons.vue');
const UserAccounts = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/user-accounts/home/UserAccounts.vue');
const AccountSettings = () => import(/* webpackChunkName: "account-settings" */ '@/ui/views/pages/system-management/lists/user-accounts/account-settings/AccountSettings.vue');
const Roles = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/Roles.vue');
const Branding = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/branding/Branding.vue');
const TenantSettings = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/tenantSettings/TenantSettings.vue');
const FeaturesComponent = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/features/Features.vue');
const CaseNoteCategories = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/CaseNoteCategories.vue');
const CaseFileCloseReasons = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/CaseFileCloseReasons.vue');
const ReferralOutcomeStatuses = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/ReferralOutcomeStatuses.vue');
const ReferralTypes = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/ReferralTypes.vue');
const FinancialAssistanceItems = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/FinancialAssistance.vue');
const ScreeningId = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/ScreeningId.vue');
const DocumentCategories = () => import(/* webpackChunkName: "system" */ '@/ui/views/pages/system-management/lists/pages/DocumentCategories.vue');

const TeamsLayout = () => import(/* webpackChunkName: "teams" */ '@/ui/views/pages/teams/layout/TeamsLayout.vue');
const TeamsHome = () => import(/* webpackChunkName: "teams" */ '@/ui/views/pages/teams/home/TeamsHome.vue');
const CreateEditTeam = () => import(/* webpackChunkName: "teams" */ '@/ui/views/pages/teams/create-edit/CreateEditTeam.vue');
const TeamDetails = () => import(/* webpackChunkName: "teams" */ '@/ui/views/pages/teams/details/TeamDetails.vue');

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
      store.commit(`${DASHBOARD_MODULE}/setProperty`, { property: 'checkingAccount', value: false });
      if (to.name !== Routes.loginError.name) {
        store.commit(`${DASHBOARD_MODULE}/setProperty`, { property: 'initLoading', value: true });
        const userAccount = await store.dispatch(`${USER_ACCOUNT_ENTITIES}/fetchCurrentUserAccount`);
        if (userAccount) {
          await Promise.all([
            store.dispatch(`${TENANT_SETTINGS_ENTITIES}/fetchLogoUrl`, 'en'),
            store.dispatch(`${TENANT_SETTINGS_ENTITIES}/fetchLogoUrl`, 'fr'),
          ]);
          await SignalR.instance.buildHubConnection();
        } else {
          helpers.redirectToLoginErrorPage();
        }
      }
      store.commit(`${DASHBOARD_MODULE}/setProperty`, { property: 'initLoading', value: false });
      Trans.routeMiddleware(to, from, next);
    },
    children: [
      {
        path: 'print-confirmation',
        name: 'print-confirmation',
        component: ConfirmationPrint,
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
          {
            path: Routes.approvals.layout.path, // approvals
            component: ApprovalsLayout,
            meta: {
              requiresAuthorization: true,
            },
            children: [
              {
                path: Routes.approvals.templates.path,
                name: Routes.approvals.templates.name,
                component: ApprovalsTemplates,
                meta: { level: 'level6' },
              },
              {
                path: Routes.approvals.request.path,
                name: Routes.approvals.request.name,
                component: ApprovalsRequest,
                meta: { roles: ['level3', 'level4'] },
              },
            ],
          },
          {
            path: Routes.assessments.layout.path, // assessments
            component: AssessmentsLayout,
            meta: {
              requiresAuthorization: true,
            },
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
            meta: {
              requiresAuthorization: true,
            },
            children: [
              {
                path: Routes.caseFile.home.path,
                name: Routes.caseFile.home.name,
                component: HomeCaseFile,
                meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
              },
              {
                path: Routes.caseFile.details.path,
                component: CaseFileDetails,
                meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                props: true,
                children: [
                  {
                    path: Routes.caseFile.activity.path,
                    name: Routes.caseFile.activity.name,
                    component: CaseFileActivity,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.note.path,
                    name: Routes.caseFile.note.name,
                    component: CaseNote,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.financialAssistance.home.path,
                    name: Routes.caseFile.financialAssistance.home.name,
                    component: FinancialAssistancePaymentsList,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.financialAssistance.create.path,
                    name: Routes.caseFile.financialAssistance.create.name,
                    component: CreateEditCaseFileFinancialAssistance,
                    meta: { level: 'level1' },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.financialAssistance.edit.path,
                    name: Routes.caseFile.financialAssistance.edit.name,
                    component: CreateEditCaseFileFinancialAssistance,
                    meta: { level: 'level1' },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.financialAssistance.details.path,
                    name: Routes.caseFile.financialAssistance.details.name,
                    component: CreateEditCaseFileFinancialAssistance,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.financialAssistance.paymentLineDetails.path,
                    name: Routes.caseFile.financialAssistance.paymentLineDetails.name,
                    component: ViewPaymentLineDetails,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.referrals.home.path,
                    name: Routes.caseFile.referrals.home.name,
                    component: CaseFileReferral,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.referrals.edit.path,
                    name: Routes.caseFile.referrals.edit.name,
                    component: CreateEditCaseFileReferral,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.referrals.add.path,
                    name: Routes.caseFile.referrals.add.name,
                    component: CreateEditCaseFileReferral,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.referrals.details.path,
                    name: Routes.caseFile.referrals.details.name,
                    component: CaseFileReferralDetails,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.documents.home.path,
                    name: Routes.caseFile.documents.home.name,
                    component: CaseFileDocument,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.documents.edit.path,
                    name: Routes.caseFile.documents.edit.name,
                    component: CreateEditCaseFileDocument,
                    meta: { level: 'level1', roles: ['contributor3'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.documents.add.path,
                    name: Routes.caseFile.documents.add.name,
                    component: CreateEditCaseFileDocument,
                    meta: { level: 'level1', roles: ['contributor3'] },
                    props: true,
                  },
                  {
                    path: Routes.caseFile.documents.details.path,
                    name: Routes.caseFile.documents.details.name,
                    component: CaseFileDocumentDetails,
                    meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                    props: true,
                  },
                ],
              },
              {
                path: Routes.household.householdProfile.path,
                name: Routes.household.householdProfile.name,
                component: HouseholdProfile,
                meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
                props: true,
              },
              {
                path: Routes.household.householdSplit.path,
                name: Routes.household.householdSplit.name,
                component: SplitHousehold,
                meta: { level: 'level1' },
                props: true,
              },
              {
                path: Routes.household.householdMembersMove.path,
                name: Routes.household.householdMembersMove.name,
                component: MoveHouseholdMembers,
                meta: { level: 'level2' },
                props: true,
              },
            ],
          },
          {
            path: Routes.householdSearch.path,
            name: Routes.householdSearch.name,
            component: MainHouseholdSearch,
            meta: { level: 'level1' },
            props: true,
          },
          {
            path: Routes.registration.layout.path, // registration
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
          },
          {
            path: Routes.events.layout.path, // events
            component: EventsLayout,
            meta: {
              requiresAuthorization: true,
            },
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
                props: true,
              },
              {
                path: Routes.events.edit.path,
                name: Routes.events.edit.name,
                component: CreateEditEvent,
                meta: { level: 'level5' },
                props: true,
              },
              {
                path: Routes.events.details.path,
                component: EventDetails,
                meta: { level: 'level4' },
                props: true,
                children: [{
                  path: Routes.events.summary.path,
                  name: Routes.events.summary.name,
                  component: EventSummary,
                  meta: { level: 'level4' },
                  props: true,
                }, {
                  path: Routes.programs.home.path,
                  name: Routes.programs.home.name,
                  component: ProgramsHome,
                  meta: { level: 'level6' },
                  props: true,
                }, {
                  path: Routes.programs.create.path,
                  name: Routes.programs.create.name,
                  component: CreateEditProgram,
                  meta: { level: 'level6' },
                  props: true,
                }, {
                  path: Routes.programs.edit.path,
                  name: Routes.programs.edit.name,
                  component: CreateEditProgram,
                  meta: { level: 'level6' },
                  props: true,
                }, {
                  path: Routes.programs.details.path,
                  name: Routes.programs.details.name,
                  component: ProgramDetails,
                  meta: { level: 'level6' },
                  props: true,
                }, {
                  path: Routes.events.financialAssistance.home.path,
                  name: Routes.events.financialAssistance.home.name,
                  component: EventFinancialAssistanceHome,
                  meta: { level: 'level6' },
                  props: true,
                }, {
                  path: Routes.events.financialAssistance.create.path,
                  name: Routes.events.financialAssistance.create.name,
                  component: CreateEditFinancialAssistance,
                  meta: { level: 'level6' },
                  props: true,
                }, {
                  path: Routes.events.financialAssistance.edit.path,
                  name: Routes.events.financialAssistance.edit.name,
                  component: CreateEditFinancialAssistance,
                  meta: { level: 'level6' },
                  props: true,
                }, {
                  path: Routes.events.financialAssistance.details.path,
                  name: Routes.events.financialAssistance.details.name,
                  component: FinancialAssistanceDetails,
                  meta: { level: 'level6' },
                  props: true,
                }],
              },
            ],
          },
          {
            path: Routes.financialAssistance.layout.path, // financial assistance
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
          },
          {
            path: Routes.massActions.layout.path, // mass actions
            component: MassActionsLayout,
            meta: {
              requiresAuthorization: true,
            },
            children: [
              {
                path: Routes.massActions.home.path,
                name: Routes.massActions.home.name,
                component: MassActionsHome,
                meta: { level: 'level6', roles: ['contributorIM', 'contributorFinance'], feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.financialAssistance.home.path,
                name: Routes.massActions.financialAssistance.home.name,
                component: MassActionsFinancialAssistanceHome,
                meta: { level: 'level6', feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.financialAssistance.create.path,
                name: Routes.massActions.financialAssistance.create.name,
                component: FinancialAssistanceCreate,
                meta: { level: 'level6', feature: FeatureKeys.MassAction },
                props: true,
              },
              {
                path: Routes.massActions.financialAssistance.details.path,
                name: Routes.massActions.financialAssistance.details.name,
                component: MassActionsFinancialAssistanceDetails,
                meta: { level: 'level6', feature: FeatureKeys.MassAction },
                props: true,
              },
              {
                path: Routes.massActions.importValidationStatus.home.path,
                name: Routes.massActions.importValidationStatus.home.name,
                component: MassActionsImportValidationStatusHome,
                meta: { level: 'level6', roles: ['contributorIM'], feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.importValidationStatus.create.path,
                name: Routes.massActions.importValidationStatus.create.name,
                component: MassActionsImportValidationStatusCreate,
                meta: { level: 'level6', roles: ['contributorIM'], feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.importValidationStatus.details.path,
                name: Routes.massActions.importValidationStatus.details.name,
                component: MassActionsImportValidationStatusDetails,
                meta: { level: 'level6', roles: ['contributorIM'], feature: FeatureKeys.MassAction },
                props: true,
              },
              {
                path: Routes.massActions.importPaymentStatus.home.path,
                name: Routes.massActions.importPaymentStatus.home.name,
                component: MassActionsImportPaymentStatusHome,
                meta: { level: 'level6', roles: ['contributorFinance'], feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.importPaymentStatus.create.path,
                name: Routes.massActions.importPaymentStatus.create.name,
                component: MassActionsImportPaymentStatusCreate,
                meta: { level: 'level6', roles: ['contributorFinance'], feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.importPaymentStatus.details.path,
                name: Routes.massActions.importPaymentStatus.details.name,
                component: MassActionsImportPaymentStatusDetails,
                meta: { level: 'level6', roles: ['contributorFinance'], feature: FeatureKeys.MassAction },
                props: true,
              },
              {
                path: Routes.massActions.importUsers.home.path,
                name: Routes.massActions.importUsers.home.name,
                component: MassActionsImportUsersHome,
                meta: { level: 'level6', feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.importUsers.create.path,
                name: Routes.massActions.importUsers.create.name,
                component: MassActionsImportUsersCreate,
                meta: { level: 'level6', feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.importUsers.details.path,
                name: Routes.massActions.importUsers.details.name,
                component: MassActionsImportUsersDetails,
                meta: { level: 'level6', feature: FeatureKeys.MassAction },
                props: true,
              },
              {
                path: Routes.massActions.fundingRequest.home.path,
                name: Routes.massActions.fundingRequest.home.name,
                component: MassActionsFundingRequestHome,
                meta: { level: 'level6', roles: ['contributorFinance'], feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.fundingRequest.create.path,
                name: Routes.massActions.fundingRequest.create.name,
                component: MassActionsFundingRequestCreate,
                meta: { level: 'level6', roles: ['contributorFinance'], feature: FeatureKeys.MassAction },
              },
              {
                path: Routes.massActions.fundingRequest.details.path,
                name: Routes.massActions.fundingRequest.details.name,
                component: MassActionsFundingRequestDetails,
                meta: { level: 'level6', roles: ['contributorFinance'], feature: FeatureKeys.MassAction },
                props: true,
              },
              {
                path: Routes.massActions.dataCorrection.home.path,
                name: Routes.massActions.dataCorrection.home.name,
                component: MassActionsDataCorrectionHome,
                meta: { level: 'level6', feature: FeatureKeys.MassActionCorrection },
              },
              {
                path: Routes.massActions.dataCorrection.create.path,
                name: Routes.massActions.dataCorrection.create.name,
                component: MassActionsDataCorrectionCreate,
                meta: { level: 'level6', feature: FeatureKeys.MassActionCorrection },
              },
              {
                path: Routes.massActions.dataCorrection.details.path,
                name: Routes.massActions.dataCorrection.details.name,
                component: MassActionsDataCorrectionDetails,
                meta: { level: 'level6', feature: FeatureKeys.MassActionCorrection },
                props: true,
              },
            ],
          },
          {
            path: Routes.systemManagement.layout.path, // system management
            component: SystemManagementLayout,
            meta: {
              requiresAuthorization: true,
            },
            children: [
              {
                path: Routes.systemManagement.home.path,
                name: Routes.systemManagement.home.name,
                component: SystemManagementHome,
                meta: { level: 'level5' },
              },
              {
                path: Routes.systemManagement.lists.path,
                name: Routes.systemManagement.lists.name,
                component: SystemManagementLists,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.caseFileTags.path,
                name: Routes.systemManagement.caseFileTags.name,
                component: CaseFileTags,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.eventTypes.path,
                name: Routes.systemManagement.eventTypes.name,
                component: EventTypes,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.genders.path,
                name: Routes.systemManagement.genders.name,
                component: Genders,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.preferredLanguages.path,
                name: Routes.systemManagement.preferredLanguages.name,
                component: PreferredLanguages,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.primarySpokenLanguages.path,
                name: Routes.systemManagement.primarySpokenLanguages.name,
                component: PrimarySpokenLanguages,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.agreementTypes.path,
                name: Routes.systemManagement.agreementTypes.name,
                component: AgreementTypes,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.caseFileInactiveReasons.path,
                name: Routes.systemManagement.caseFileInactiveReasons.name,
                component: CaseFileInactiveReasons,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.userAccounts.home.path,
                name: Routes.systemManagement.userAccounts.home.name,
                component: UserAccounts,
                meta: { level: 'level5' },
              },
              {
                path: Routes.systemManagement.userAccounts.details.path,
                name: Routes.systemManagement.userAccounts.details.name,
                component: AccountSettings,
                meta: { level: 'level5' },
              },
              {
                path: Routes.systemManagement.roles.path,
                name: Routes.systemManagement.roles.name,
                component: Roles,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.branding.path,
                name: Routes.systemManagement.branding.name,
                component: Branding,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.tenantSettings.path,
                name: Routes.systemManagement.tenantSettings.name,
                component: TenantSettings,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.features.path,
                name: Routes.systemManagement.features.name,
                component: FeaturesComponent,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.caseNoteCategories.path,
                name: Routes.systemManagement.caseNoteCategories.name,
                component: CaseNoteCategories,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.caseFileCloseReasons.path,
                name: Routes.systemManagement.caseFileCloseReasons.name,
                component: CaseFileCloseReasons,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.referralOutcomeStatuses.path,
                name: Routes.systemManagement.referralOutcomeStatuses.name,
                component: ReferralOutcomeStatuses,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.referralTypes.path,
                name: Routes.systemManagement.referralTypes.name,
                component: ReferralTypes,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.financialAssistance.path,
                name: Routes.systemManagement.financialAssistance.name,
                component: FinancialAssistanceItems,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.screeningId.path,
                name: Routes.systemManagement.screeningId.name,
                component: ScreeningId,
                meta: { level: 'level6' },
              },
              {
                path: Routes.systemManagement.documentCategories.path,
                name: Routes.systemManagement.documentCategories.name,
                component: DocumentCategories,
                meta: { level: 'level6' },
              },
            ],
          },
          {
            path: Routes.teams.layout.path, // teams
            component: TeamsLayout,
            meta: {
              requiresAuthorization: true,
            },
            children: [
              {
                path: Routes.teams.home.path,
                name: Routes.teams.home.name,
                component: TeamsHome,
                meta: { level: 'level3' },
              },
              {
                path: Routes.teams.create.path,
                name: Routes.teams.create.name,
                component: CreateEditTeam,
                meta: { level: 'level5' },
                props: true,
              },
              {
                path: Routes.teams.edit.path,
                name: Routes.teams.edit.name,
                component: CreateEditTeam,
                meta: { level: 'level4' },
                props: true,
              },
              {
                path: Routes.teams.details.path,
                name: Routes.teams.details.name,
                component: TeamDetails,
                meta: { level: 'level3' },
                props: true,
              },
            ],
          },
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
