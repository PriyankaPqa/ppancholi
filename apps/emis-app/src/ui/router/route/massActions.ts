import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';
import { UserRoles } from '@libs/entities-lib/user';

const MassActionsLayout = () => import('@/ui/views/pages/mass-actions/layout/MassActionsLayout.vue');
const MassActionsHome = () => import('@/ui/views/pages/mass-actions/home/MassActionsHome.vue');

const MassActionsFinancialAssistanceHome = () => import('@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistanceHomeMassAction.vue');
const FinancialAssistanceCreate = () => import('@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistanceCreate.vue');
const MassActionsFinancialAssistanceDetails = () => import('@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistanceDetailsMassAction.vue');

const MassActionsFinancialAssistanceCustomHome = () => import('@/ui/views/pages/mass-actions/financial-assistance-custom/FinancialAssistanceCustomHome.vue');
const FinancialAssistanceCustomCreate = () => import('@/ui/views/pages/mass-actions/financial-assistance-custom/FinancialAssistanceCustomCreate.vue');
const MassActionsFinancialAssistanceCustomDetails = () => import('@/ui/views/pages/mass-actions/financial-assistance-custom/FinancialAssistanceCustomDetails.vue');

const MassActionsAssessmentHome = () => import('@/ui/views/pages/mass-actions/assessments/AssessmentHomeMassAction.vue');
const MassActionsAssessmentCreate = () => import('@/ui/views/pages/mass-actions/assessments/AssessmentCreate.vue');
const MassActionsAssessmentDetails = () => import('@/ui/views/pages/mass-actions/assessments/AssessmentDetailsMassAction.vue');

const MassActionsCommunicationHome = () => import('@/ui/views/pages/mass-actions/communications/CommunicationHomeMassAction.vue');
const MassActionsCommunicationCreate = () => import('@/ui/views/pages/mass-actions/communications/CommunicationCreate.vue');
const MassActionsCommunicationDetails = () => import('@/ui/views/pages/mass-actions/communications/CommunicationDetailsMassAction.vue');

const MassActionsImportValidationStatusHome = () => import('@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusHome.vue');
const MassActionsImportValidationStatusCreate = () => import('@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusCreate.vue');
const MassActionsImportValidationStatusDetails = () => import('@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusDetails.vue');

const MassActionsImportPaymentStatusHome = () => import('@/ui/views/pages/mass-actions/import-payment-status/ImportPaymentStatusHome.vue');
const MassActionsImportPaymentStatusCreate = () => import('@/ui/views/pages/mass-actions/import-payment-status/ImportPaymentStatusCreate.vue');
const MassActionsImportPaymentStatusDetails = () => import('@/ui/views/pages/mass-actions/import-payment-status/ImportPaymentStatusDetails.vue');

const MassActionsImportUsersHome = () => import('@/ui/views/pages/mass-actions/import-users/ImportUsersHome.vue');
const MassActionsImportUsersCreate = () => import('@/ui/views/pages/mass-actions/import-users/ImportUsersCreate.vue');
const MassActionsImportUsersDetails = () => import('@/ui/views/pages/mass-actions/import-users/ImportUsersDetails.vue');

const MassActionsFundingRequestHome = () => import('@/ui/views/pages/mass-actions/funding-request/FundingRequestHome.vue');
const MassActionsFundingRequestCreate = () => import('@/ui/views/pages/mass-actions/funding-request/FundingRequestCreate.vue');
const MassActionsFundingRequestDetails = () => import('@/ui/views/pages/mass-actions/funding-request/FundingRequestDetails.vue');

const MassActionsDataCorrectionHome = () => import('@/ui/views/pages/mass-actions/data-correction/DataCorrectionHome.vue');
const MassActionsDataCorrectionCreate = () => import('@/ui/views/pages/mass-actions/data-correction/DataCorrectionCreate.vue');
const MassActionsDataCorrectionDetails = () => import('@/ui/views/pages/mass-actions/data-correction/DataCorrectionDetails.vue');

const MassActionsCaseFileStatusHome = () => import('@/ui/views/pages/mass-actions/case-file-status/CaseFileStatusMassActionHome.vue');
const MassActionsCaseFileStatusCreate = () => import('@/ui/views/pages/mass-actions/case-file-status/CaseFileStatusMassActionCreate.vue');
const MassActionsCaseFileStatusDetails = () => import('@/ui/views/pages/mass-actions/case-file-status/CaseFileStatusMassActionDetails.vue');

export const massActions: RouteConfig = {
  path: Routes.massActions.layout.path,
  component: MassActionsLayout,
  meta: {
    requiresAuthorization: true,
  },
  children: [
    {
      path: Routes.massActions.home.path,
      name: Routes.massActions.home.name,
      component: MassActionsHome,
      meta: { level: UserRoles.level5, roles: [UserRoles.contributorIM, UserRoles.contributorFinance] },
    },
    {
      path: Routes.massActions.financialAssistance.home.path,
      name: Routes.massActions.financialAssistance.home.name,
      component: MassActionsFinancialAssistanceHome,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.massActions.financialAssistance.create.path,
      name: Routes.massActions.financialAssistance.create.name,
      component: FinancialAssistanceCreate,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.massActions.financialAssistance.details.path,
      name: Routes.massActions.financialAssistance.details.name,
      component: MassActionsFinancialAssistanceDetails,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.massActions.financialAssistanceCustom.home.path,
      name: Routes.massActions.financialAssistanceCustom.home.name,
      component: MassActionsFinancialAssistanceCustomHome,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.massActions.financialAssistanceCustom.create.path,
      name: Routes.massActions.financialAssistanceCustom.create.name,
      component: FinancialAssistanceCustomCreate,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.massActions.financialAssistanceCustom.details.path,
      name: Routes.massActions.financialAssistanceCustom.details.name,
      component: MassActionsFinancialAssistanceCustomDetails,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.massActions.assessments.home.path,
      name: Routes.massActions.assessments.home.name,
      component: MassActionsAssessmentHome,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.massActions.assessments.create.path,
      name: Routes.massActions.assessments.create.name,
      component: MassActionsAssessmentCreate,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.massActions.assessments.details.path,
      name: Routes.massActions.assessments.details.name,
      component: MassActionsAssessmentDetails,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.massActions.communications.home.path,
      name: Routes.massActions.communications.home.name,
      component: MassActionsCommunicationHome,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.massActions.communications.create.path,
      name: Routes.massActions.communications.create.name,
      component: MassActionsCommunicationCreate,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.massActions.communications.details.path,
      name: Routes.massActions.communications.details.name,
      component: MassActionsCommunicationDetails,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.massActions.importValidationStatus.home.path,
      name: Routes.massActions.importValidationStatus.home.name,
      component: MassActionsImportValidationStatusHome,
      meta: { level: UserRoles.level6, roles: [UserRoles.contributorIM] },
    },
    {
      path: Routes.massActions.importValidationStatus.create.path,
      name: Routes.massActions.importValidationStatus.create.name,
      component: MassActionsImportValidationStatusCreate,
      meta: { level: UserRoles.level6, roles: [UserRoles.contributorIM] },
    },
    {
      path: Routes.massActions.importValidationStatus.details.path,
      name: Routes.massActions.importValidationStatus.details.name,
      component: MassActionsImportValidationStatusDetails,
      meta: { level: UserRoles.level6, roles: [UserRoles.contributorIM] },
      props: true,
    },
    {
      path: Routes.massActions.importPaymentStatus.home.path,
      name: Routes.massActions.importPaymentStatus.home.name,
      component: MassActionsImportPaymentStatusHome,
      meta: { level: UserRoles.level6, roles: [UserRoles.contributorFinance] },
    },
    {
      path: Routes.massActions.importPaymentStatus.create.path,
      name: Routes.massActions.importPaymentStatus.create.name,
      component: MassActionsImportPaymentStatusCreate,
      meta: { level: UserRoles.level6, roles: [UserRoles.contributorFinance] },
    },
    {
      path: Routes.massActions.importPaymentStatus.details.path,
      name: Routes.massActions.importPaymentStatus.details.name,
      component: MassActionsImportPaymentStatusDetails,
      meta: { level: UserRoles.level6, roles: [UserRoles.contributorFinance] },
      props: true,
    },
    {
      path: Routes.massActions.importUsers.home.path,
      name: Routes.massActions.importUsers.home.name,
      component: MassActionsImportUsersHome,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.massActions.importUsers.create.path,
      name: Routes.massActions.importUsers.create.name,
      component: MassActionsImportUsersCreate,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.massActions.importUsers.details.path,
      name: Routes.massActions.importUsers.details.name,
      component: MassActionsImportUsersDetails,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.massActions.fundingRequest.home.path,
      name: Routes.massActions.fundingRequest.home.name,
      component: MassActionsFundingRequestHome,
      meta: { level: UserRoles.level6, roles: [UserRoles.contributorFinance] },
    },
    {
      path: Routes.massActions.fundingRequest.create.path,
      name: Routes.massActions.fundingRequest.create.name,
      component: MassActionsFundingRequestCreate,
      meta: { level: UserRoles.level6, roles: [UserRoles.contributorFinance] },
    },
    {
      path: Routes.massActions.fundingRequest.details.path,
      name: Routes.massActions.fundingRequest.details.name,
      component: MassActionsFundingRequestDetails,
      meta: { level: UserRoles.level6, roles: [UserRoles.contributorFinance] },
      props: true,
    },
    {
      path: Routes.massActions.dataCorrection.home.path,
      name: Routes.massActions.dataCorrection.home.name,
      component: MassActionsDataCorrectionHome,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.massActions.dataCorrection.create.path,
      name: Routes.massActions.dataCorrection.create.name,
      component: MassActionsDataCorrectionCreate,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.massActions.dataCorrection.details.path,
      name: Routes.massActions.dataCorrection.details.name,
      component: MassActionsDataCorrectionDetails,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.massActions.caseFileStatus.home.path,
      name: Routes.massActions.caseFileStatus.home.name,
      component: MassActionsCaseFileStatusHome,
      meta: { level: UserRoles.level5 },
    },
    {
      path: Routes.massActions.caseFileStatus.create.path,
      name: Routes.massActions.caseFileStatus.create.name,
      component: MassActionsCaseFileStatusCreate,
      meta: { level: UserRoles.level5 },
    },
    {
      path: Routes.massActions.caseFileStatus.details.path,
      name: Routes.massActions.caseFileStatus.details.name,
      component: MassActionsCaseFileStatusDetails,
      meta: { level: UserRoles.level5 },
      props: true,
    },
  ],
};
