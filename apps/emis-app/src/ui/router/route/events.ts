import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';
import { UserRoles } from '@libs/entities-lib/user';

const AssessmentTemplatesHome = () => import('@/ui/views/pages/assessment-templates/home/AssessmentTemplatesHome.vue');
const AssessmentTemplatesEdit = () => import('@/ui/views/pages/assessment-templates/details/CreateEditAssessmentTemplate.vue');
const AssessmentTemplateDetails = () => import('@/ui/views/pages/assessment-templates/details/AssessmentTemplateDetails.vue');

const ApprovalsTableCreateEdit = () => import('@/ui/views/pages/approvals/create-edit/CreateEditApprovals.vue');
const ApprovalTablesHome = () => import('@/ui/views/pages/approvals/tables/ApprovalTablesHome.vue');
const ApprovalDetails = () => import('@/ui/views/pages/approvals/details/ApprovalDetails.vue');

const EventsLayout = () => import('@/ui/views/pages/events/layout/EventsLayout.vue');
const HomeEvents = () => import('@/ui/views/pages/events/home/EventsHome.vue');
const CreateEditEvent = () => import('@/ui/views/pages/events/create-edit/CreateEditEvent.vue');
const EventDetails = () => import('@/ui/views/pages/events/details/EventDetails.vue');
const EventSummary = () => import('@/ui/views/pages/events/details/EventSummary.vue');
const ProgramsHome = () => import('@/ui/views/pages/programs/home/ProgramsHome.vue');
const CreateEditProgram = () => import('@/ui/views/pages/programs/create-edit/CreateEditProgram.vue');
const ProgramDetails = () => import('@/ui/views/pages/programs/details/ProgramDetails.vue');

const EventFinancialAssistanceHome = () => import('@/ui/views/pages/events/details/components/EventFinancialAssistanceHome.vue');
const CreateEditFinancialAssistance = () => import('@/ui/views/pages/financial-assistance/create-edit/CreateEditFinancialAssistance.vue');
const FinancialAssistanceDetails = () => import('@/ui/views/pages/financial-assistance/FinancialAssistanceDetails.vue');

const AppointmentProgramsHome = () => import('@/ui/views/pages/appointment-programs/home/AppointmentProgramsHome.vue');
const CreateEditAppointmentProgram = () => import('@/ui/views/pages/appointment-programs/create-edit/CreateEditAppointmentProgram.vue');
const AppointmentProgramDetails = () => import('@/ui/views/pages/appointment-programs/details/AppointmentProgramDetails.vue');
const ServiceOptionDetails = () => import('@/ui/views/pages/appointment-programs/details/ServiceOptionDetails.vue');

export const events: RouteConfig = {
  path: Routes.events.layout.path,
  component: EventsLayout,
  meta: {
    requiresAuthorization: true,
  },
  children: [
    {
      path: Routes.events.home.path,
      name: Routes.events.home.name,
      component: HomeEvents,
      meta: { level: UserRoles.level4, roles: [UserRoles.contributorIM] },
    },
    {
      path: Routes.events.create.path,
      name: Routes.events.create.name,
      component: CreateEditEvent,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.events.edit.path,
      name: Routes.events.edit.name,
      component: CreateEditEvent,
      meta: { level: UserRoles.level5 },
      props: true,
    },
    {
      path: Routes.events.details.path,
      component: EventDetails,
      meta: { level: UserRoles.level4 },
      props: true,
      children: [
        {
          path: Routes.events.summary.path,
          name: Routes.events.summary.name,
          component: EventSummary,
          meta: { level: UserRoles.level4, roles: [UserRoles.contributorIM] },
          props: true,
        },
        {
          path: Routes.programs.home.path,
          name: Routes.programs.home.name,
          component: ProgramsHome,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.programs.create.path,
          name: Routes.programs.create.name,
          component: CreateEditProgram,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.programs.edit.path,
          name: Routes.programs.edit.name,
          component: CreateEditProgram,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.programs.details.path,
          name: Routes.programs.details.name,
          component: ProgramDetails,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.financialAssistance.home.path,
          name: Routes.events.financialAssistance.home.name,
          component: EventFinancialAssistanceHome,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.financialAssistance.create.path,
          name: Routes.events.financialAssistance.create.name,
          component: CreateEditFinancialAssistance,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.financialAssistance.edit.path,
          name: Routes.events.financialAssistance.edit.name,
          component: CreateEditFinancialAssistance,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.financialAssistance.details.path,
          name: Routes.events.financialAssistance.details.name,
          component: FinancialAssistanceDetails,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.approvals.home.path,
          name: Routes.events.approvals.home.name,
          component: ApprovalTablesHome,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.approvals.create.path,
          name: Routes.events.approvals.create.name,
          component: ApprovalsTableCreateEdit,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.approvals.edit.path,
          name: Routes.events.approvals.edit.name,
          component: ApprovalsTableCreateEdit,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.approvals.details.path,
          name: Routes.events.approvals.details.name,
          component: ApprovalDetails,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.assessments.home.path,
          name: Routes.events.assessments.home.name,
          component: AssessmentTemplatesHome,
          meta: {
            level: UserRoles.level6, requiresAuthorization: true,
          },
          props: true,
        },
        {
          path: Routes.events.assessments.create.path,
          name: Routes.events.assessments.create.name,
          component: AssessmentTemplatesEdit,
          meta: {
            level: UserRoles.level6, requiresAuthorization: true,
          },
          props: true,
          children: [],
        },
        {
          path: Routes.events.assessments.duplicate.path,
          name: Routes.events.assessments.duplicate.name,
          component: AssessmentTemplatesEdit,
          meta: {
            level: UserRoles.level6, requiresAuthorization: true,
          },
          props: true,
          children: [],
        },
        {
          path: Routes.events.assessments.edit.path,
          name: Routes.events.assessments.edit.name,
          component: AssessmentTemplatesEdit,
          meta: {
            level: UserRoles.level6, requiresAuthorization: true,
          },
          props: true,
          children: [],
        },
        {
          path: Routes.events.assessments.details.path,
          name: Routes.events.assessments.details.name,
          component: AssessmentTemplateDetails,
          meta: {
            level: UserRoles.level6, requiresAuthorization: true,
          },
          props: true,
          children: [],
        },
        {
          path: Routes.events.appointmentPrograms.home.path,
          name: Routes.events.appointmentPrograms.home.name,
          component: AppointmentProgramsHome,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.appointmentPrograms.create.path,
          name: Routes.events.appointmentPrograms.create.name,
          component: CreateEditAppointmentProgram,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.appointmentPrograms.edit.path,
          name: Routes.events.appointmentPrograms.edit.name,
          component: CreateEditAppointmentProgram,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.appointmentPrograms.serviceOptionDetails.path,
          name: Routes.events.appointmentPrograms.serviceOptionDetails.name,
          component: ServiceOptionDetails,
          meta: { level: UserRoles.level6 },
          props: true,
        },
        {
          path: Routes.events.appointmentPrograms.details.path,
          name: Routes.events.appointmentPrograms.details.name,
          component: AppointmentProgramDetails,
          meta: { level: UserRoles.level6 },
          props: true,
        }],
    },
  ],
};
