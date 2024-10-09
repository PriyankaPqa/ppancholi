import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';
import { UserRoles } from '@libs/entities-lib/user';

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

const ImpactedIndividuals = () => import('@/ui/views/pages/case-files/details/case-file-impacted-individuals/ImpactedIndividuals.vue');
const ImpactedIndividualsV2 = () => import('@/ui/views/pages/case-files/details/case-file-impacted-individualsV2/ImpactedIndividualsV2.vue');
const CaseFileTaskTable = () => import('@/ui/views/pages/case-files/details/case-file-task/CaseFileTaskTable.vue');
const CreateEditTask = () => import('@/ui/views/pages/case-files/details/case-file-task/create-edit/CreateEditTask.vue');
const TaskDetails = () => import('@/ui/views/pages/case-files/details/case-file-task/details/TaskDetails.vue');
const CreateEditRecoveryPlan = () => import('@/ui/views/pages/case-files/details/case-file-recovery-plan/create-edit/CreateEditRecoveryPlan.vue');
const RecoveryPlanDetails = () => import('@/ui/views/pages/case-files/details/case-file-recovery-plan/details/RecoveryPlanDetails.vue');

const CaseFileAppointments = () => import('@/ui/views/pages/case-files/details/case-file-appointment/CaseFileAppointments.vue');
const CreateEditAppointment = () => import('@/ui/views/pages/case-files/details/case-file-appointment/components/CreateEditAppointment.vue');
const AppointmentDetails = () => import('@/ui/views/pages/case-files/details/case-file-appointment/components/AppointmentDetails.vue');

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
      meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
    },
    {
      path: Routes.caseFile.details.path,
      component: CaseFileDetails,
      meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
      props: true,
      children: [
        {
          path: Routes.caseFile.activity.path,
          name: Routes.caseFile.activity.name,
          component: CaseFileActivity,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.assessments.home.path,
          name: Routes.caseFile.assessments.home.name,
          component: CaseFileAssessments,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.assessments.details.path,
          name: Routes.caseFile.assessments.details.name,
          component: CaseFileAssessmentDetails,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.note.path,
          name: Routes.caseFile.note.name,
          component: CaseNote,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.financialAssistance.home.path,
          name: Routes.caseFile.financialAssistance.home.name,
          component: FinancialAssistancePaymentsList,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.financialAssistance.create.path,
          name: Routes.caseFile.financialAssistance.create.name,
          component: CreateEditCaseFileFinancialAssistance,
          meta: { level: UserRoles.level1 },
          props: true,
        },
        {
          path: Routes.caseFile.financialAssistance.edit.path,
          name: Routes.caseFile.financialAssistance.edit.name,
          component: CreateEditCaseFileFinancialAssistance,
          meta: { level: UserRoles.level1 },
          props: true,
        },
        {
          path: Routes.caseFile.financialAssistance.details.path,
          name: Routes.caseFile.financialAssistance.details.name,
          component: CreateEditCaseFileFinancialAssistance,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.financialAssistance.paymentLineDetails.path,
          name: Routes.caseFile.financialAssistance.paymentLineDetails.name,
          component: ViewPaymentLineDetails,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.referrals.home.path,
          name: Routes.caseFile.referrals.home.name,
          component: CaseFileReferral,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.referrals.edit.path,
          name: Routes.caseFile.referrals.edit.name,
          component: CreateEditCaseFileReferral,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.referrals.add.path,
          name: Routes.caseFile.referrals.add.name,
          component: CreateEditCaseFileReferral,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.referrals.details.path,
          name: Routes.caseFile.referrals.details.name,
          component: CaseFileReferralDetails,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.documents.home.path,
          name: Routes.caseFile.documents.home.name,
          component: CaseFileDocument,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.documents.edit.path,
          name: Routes.caseFile.documents.edit.name,
          component: CreateEditCaseFileDocument,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributor3] },
          props: true,
        },
        {
          path: Routes.caseFile.documents.add.path,
          name: Routes.caseFile.documents.add.name,
          component: CreateEditCaseFileDocument,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributor3] },
          props: true,
        },
        {
          path: Routes.caseFile.documents.details.path,
          name: Routes.caseFile.documents.details.name,
          component: CaseFileDocumentDetails,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.impactedIndividuals.home.path,
          name: Routes.caseFile.impactedIndividuals.home.name,
          component: ImpactedIndividuals,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.impactedIndividuals.homeV2.path,
          name: Routes.caseFile.impactedIndividuals.homeV2.name,
          component: ImpactedIndividualsV2,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.task.home.path,
          name: Routes.caseFile.task.home.name,
          component: CaseFileTaskTable,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.task.create.path,
          name: Routes.caseFile.task.create.name,
          component: CreateEditTask,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.task.edit.path,
          name: Routes.caseFile.task.edit.name,
          component: CreateEditTask,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.task.details.path,
          name: Routes.caseFile.task.details.name,
          component: TaskDetails,
          meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
          props: true,
        },
        {
          path: Routes.caseFile.recoveryPlan.create.path,
          name: Routes.caseFile.recoveryPlan.create.name,
          component: CreateEditRecoveryPlan,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributor3] },
          props: true,
        },
        {
          path: Routes.caseFile.recoveryPlan.edit.path,
          name: Routes.caseFile.recoveryPlan.edit.name,
          component: CreateEditRecoveryPlan,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributor3] },
          props: true,
        },
        {
          path: Routes.caseFile.recoveryPlan.details.path,
          name: Routes.caseFile.recoveryPlan.details.name,
          component: RecoveryPlanDetails,
          meta: { level: UserRoles.level1, roles: [UserRoles.contributor3] },
          props: true,
        },
        {
          path: Routes.caseFile.appointments.home.path,
          name: Routes.caseFile.appointments.home.name,
          component: CaseFileAppointments,
          meta: { level: UserRoles.level0 },
          props: true,
        },
        {
          path: Routes.caseFile.appointments.add.path,
          name: Routes.caseFile.appointments.add.name,
          component: CreateEditAppointment,
          meta: { level: UserRoles.level0 },
          props: true,
        },
        {
          path: Routes.caseFile.appointments.details.path,
          name: Routes.caseFile.appointments.details.name,
          component: AppointmentDetails,
          meta: { level: UserRoles.level0 },
          props: true,
        },
      ],
    },
    {
      path: Routes.household.householdProfile.path,
      name: Routes.household.householdProfile.name,
      component: HouseholdProfile,
      meta: { level: UserRoles.level0, roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly] },
      props: true,
    },
    {
      path: Routes.household.householdSplit.path,
      name: Routes.household.householdSplit.name,
      component: SplitHousehold,
      meta: { level: UserRoles.level1 },
      props: true,
    },
    {
      path: Routes.household.householdMembersMove.path,
      name: Routes.household.householdMembersMove.name,
      component: MoveHouseholdMembers,
      meta: { level: UserRoles.level2 },
      props: true,
    },
  ],
};
