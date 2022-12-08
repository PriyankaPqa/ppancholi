import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';

const CaseFileLayout = () => import('@/ui/views/pages/case-files/layout/CaseFileLayout.vue');
const HomeCaseFile = () => import('@/ui/views/pages/case-files/home/CaseFileHome.vue');
const CaseFileDetails = () => import('@/ui/views/pages/case-files/details/CaseFileDetails.vue');
const CaseFileActivity = () => import('@/ui/views/pages/case-files/details/case-file-activity/CaseFileActivity.vue');
const CaseNote = () => import('@/ui/views/pages/case-files/details/case-file-note/CaseNote.vue');

const CaseFileAssessments = () => import('@/ui/views/pages/case-files/details/case-file-assessment/CaseFileAssessment.vue');
const CaseFileAssessmentDetails = () => import('@/ui/views/pages/case-files/details/case-file-assessment/components/AssessmentDetails.vue');

const FinancialAssistancePaymentsList = () => import('@/ui/views/pages/case-files/details/case-file-financial-assistance/FinancialAssistancePaymentsList.vue');
// eslint-disable-next-line vue/max-len
const CreateEditCaseFileFinancialAssistance = () => import('@/ui/views/pages/case-files/details/case-file-financial-assistance/components/CreateEditFinancialAssistanceCaseFile.vue');
const ViewPaymentLineDetails = () => import('@/ui/views/pages/case-files/details/case-file-financial-assistance/components/ViewPaymentLineDetails.vue');

const CaseFileReferral = () => import('@/ui/views/pages/case-files/details/case-file-referral/CaseFileReferral.vue');
const CaseFileReferralDetails = () => import('@/ui/views/pages/case-files/details/case-file-referral/components/CaseFileReferralDetails.vue');
const CreateEditCaseFileReferral = () => import('@/ui/views/pages/case-files/details/case-file-referral/components/CreateEditReferral.vue');

const CaseFileDocument = () => import('@/ui/views/pages/case-files/details/case-file-document/CaseFileDocument.vue');
const CreateEditCaseFileDocument = () => import('@/ui/views/pages/case-files/details/case-file-document/components/CreateEditCaseFileDocument.vue');
const CaseFileDocumentDetails = () => import('@/ui/views/pages/case-files/details/case-file-document/components/CaseFileDocumentDetails.vue');

const HouseholdProfile = () => import('@/ui/views/pages/household/HouseholdProfile.vue');
const SplitHousehold = () => import('@/ui/views/pages/household/split/SplitHousehold.vue');
const MoveHouseholdMembers = () => import('@/ui/views/pages/household/move/MoveHouseholdMembers.vue');

export const caseFiles: RouteConfig = {
  path: Routes.caseFile.layout.path,
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
          path: Routes.caseFile.assessments.home.path,
          name: Routes.caseFile.assessments.home.name,
          component: CaseFileAssessments,
          meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
          props: true,
        },
        {
          path: Routes.caseFile.assessments.details.path,
          name: Routes.caseFile.assessments.details.name,
          component: CaseFileAssessmentDetails,
          meta: { level: 'level1', roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly'] },
          props: true,
        },
        {
          path: Routes.caseFile.assessments.edit.path,
          name: Routes.caseFile.assessments.edit.name,
          component: CaseFileAssessmentDetails,
          meta: { level: 'level3' },
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
};
