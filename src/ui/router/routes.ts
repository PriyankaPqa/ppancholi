import { RouteConfig } from 'vue-router';
/* eslint-disable max-len */

import { Trans } from '@/ui/plugins/translation';
import Routes from '../../constants/routes';

// /* Self Registration */
// const SelfRegistrationPortal = () => import(/* webpackChunkName: "self-registration" */ '@/ui/views/Registration/SelfRegistration/SelfRegistrationPortal.vue');
// const SelfRegistrationLandingPage = () => import(/* webpackChunkName: "self-registration" */ '@/ui/views/Registration/SelfRegistration/Layout/SelfRegistrationLandingPage.vue');
// const SelfRegistrationIndividual = () => import(/* webpackChunkName: "self-registration" */ '@/ui/views/Registration/SelfRegistration/Layout/SelfRegistrationIndividual.vue');
// const ConfirmationPrint = () => import(/* webpackChunkName: "self-registration" */ '@/ui/views/Registration/Components/Confirmation/ConfirmationPrint.vue');
//
// /* ADD ROUTES FOR DASHBOARD HERE */
// const DashboardPortalLayout = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/Dashboard/Layout/DashboardLayout.vue');
// const DashboardHome = () => import(/* webpackChunkName: "dashboard" */ '@/ui/views/Dashboard/Pages/Home/Layout/HomeLayout.vue');
// const DashboardAssessments = () => import(/* webpackChunkName: "assessments" */ '@/ui/views/Dashboard/Pages/Assessments.vue');
// const DashboardReports = () => import(/* webpackChunkName: "reports" */ '@/ui/views/Dashboard/Pages/Reports/ReportsLayout.vue');
//
// /* Events */
// const HomeEvents = () => import(/* webpackChunkName: "events" */ '@/ui/views/Dashboard/Pages/Events/Components/EventsHome.vue');
// const CreateEditEvent = () => import(/* webpackChunkName: "events" */ '@/ui/views/Dashboard/Pages/Events/Components/EventCreateEdit/CreateEditEvent.vue');
// const EventsLayout = () => import(/* webpackChunkName: "events" */ '@/ui/views/Dashboard/Pages/Events/Layout/EventsLayout.vue');
// const EventDetail = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventDetail.vue');
// const EventSummary = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventSummary/EventSummary.vue');
// const EventProgramList = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventProgramsManagement/EventProgramList.vue');
// const EventProgramForm = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventProgramsManagement/EventProgramForm.vue');
// const EventProgramDetails = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventProgramsManagement/EventProgramDetails.vue');
// const EventTeams = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventTeamManagement/EventTeamManagement.vue');
// const EventApprovals = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventApprovals/EventApprovals.vue');
// const EventAssessments = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventAssessments/EventAssessments.vue');
// const EventBeneficiaries = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventBeneficiaries/EventBeneficiaries.vue');
// const EventFinancial = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventFinancialAssistance/EventFinancialAssistance.vue');
// const FinancialAssistanceTablesList = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventFinancialAssistance/FinancialAssistanceTablesList.vue');
// const ApprovalTablesList = () => import(/* webpackChunkName: "eventsDetail" */ '@/ui/views/Dashboard/Pages/Events/Components/EventApprovals/ApprovalTablesList.vue');
//
// /* CRC Registration */
// const CRCRegistrationPortal = () => import(/* webpackChunkName: "crc-registration" */ '@/ui/views/Registration/CRCRegistration/CRCRegistrationPortal.vue');
// const CRCRegistrationLandingPage = () => import(/* webpackChunkName: "crc-registration" */ '@/ui/views/Registration/CRCRegistration/Layout/CRCRegistrationLandingPage.vue');
// const CRCRegistrationIndividual = () => import(/* webpackChunkName: "crc-registration" */ '@/ui/views/Registration/CRCRegistration/Layout/CRCRegistrationIndividual.vue');

const PageNotFound = () => import(/* webpackChunkName: "not-found" */ '@/ui/views/PageNotFound.vue');

// /* Teams */
// const DashboardTeams = () => import(/* webpackChunkName: "teams" */ '@/ui/views/Dashboard/Pages/TeamManagement/Layout/TeamManagementLayout.vue');
// const TeamTable = () => import(/* webpackChunkName: "teams" */ '@/ui/views/Dashboard/Pages/TeamManagement/Components/TeamTable.vue');
// const CreateEditTeam = () => import(/* webpackChunkName: "teams" */ '@/ui/views/Dashboard/Pages/TeamManagement/Components/CreateEditTeam.vue');
// const TeamDetail = () => import(/* webpackChunkName: "teams" */ '@/ui/views/Dashboard/Pages/TeamManagement/Components/TeamDetail.vue');
//
// /* System Management */
// const SystemManagementLayout = () => import(/* webpackChunkName: "system-management" */ '@/ui/views/Dashboard/Pages/SystemManagement/Layout/SystemManagementLayout.vue');
// const HomeSystemManagement = () => import(/* webpackChunkName: "system-management" */ '@/ui/views/Dashboard/Pages/SystemManagement/Components/SystemManagementHome.vue');
// const OptionLists = () => import(/* webpackChunkName: "lists" */ '@/ui/views/Dashboard/Pages/SystemManagement/Components/Lists/OptionLists.vue');
// const OptionListItems = () => import(/* webpackChunkName: "lists" */ '@/ui/views/Dashboard/Pages/SystemManagement/Components/Lists/OptionListItems.vue');
//
// /* Case File */
// const HomeCaseFile = () => import(/* webpackChunkName: "caseFile" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/CaseFileHome.vue');
// const CaseFileLayout = () => import(/* webpackChunkName: "caseFile" */ '@/ui/views/Dashboard/Pages/CaseFile/Layout/CaseFileLayout.vue');
// const CaseFileDetail = () => import(/* webpackChunkName: "caseFileDetail" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/CaseFileDetail.vue');
// const CaseFileActivity = () => import(/* webpackChunkName: "caseFileDetail" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/CaseFileActivity/CaseFileActivity.vue');
// const CaseFileAssessments = () => import(/* webpackChunkName: "caseFileDetail" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/CaseFileAssessments.vue');
// const CaseNotes = () => import(/* webpackChunkName: "caseFileDetail" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/CaseNotes/CaseNotes.vue');
//
// /* Case File Financial Assistance */
// const TransactionsList = () => import(/* webpackChunkName: "caseFileFinancial" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/FinancialAssistance/TransactionsList.vue');
// const CreateTransaction = () => import(/* webpackChunkName: "caseFileFinancial" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/FinancialAssistance/CreateTransaction.vue');
// const TransactionDetails = () => import(/* webpackChunkName: "caseFileFinancial" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/FinancialAssistance/TransactionDetails.vue');
// const PaymentLineDetails = () => import(/* webpackChunkName: "caseFileFinancial" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/FinancialAssistance/PaymentLineDetails.vue');
//
// /* Referrals */
// const ReferralsHome = () => import(/* webpackChunkName: "referrals" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/Referrals/ReferralsHome.vue');
// const ReferralCreateEdit = () => import(/* webpackChunkName: "referrals" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/Referrals/ReferralCreateEdit.vue');
// const ReferralDetails = () => import(/* webpackChunkName: "referrals" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/Referrals/ReferralDetails.vue');
//
// /* Beneficiary Profile */
// const BeneficiaryProfileHome = () => import(/* webpackChunkName: "beneficiaryProfile" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/BeneficiaryProfile/BeneficiaryProfileHome.vue');
// const BeneficiaryProfileView = () => import(/* webpackChunkName: "beneficiaryProfile" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/BeneficiaryProfile/BeneficiaryProfileView.vue');
// const BeneficiaryProfileEdit = () => import(/* webpackChunkName: "beneficiaryProfileEdit" */ '@/ui/views/Dashboard/Pages/CaseFile/Components/BeneficiaryProfile/BeneficiaryProfileEdit.vue');
//
// /* Account Settings */
// const AccountSettingsLayout = () => import(/* webpackChunkName: "beneficiaryProfile" */ '@/ui/views/Dashboard/Pages/AccountSettings/Layout/AccountSettingsLayout.vue');
// const AccountSettingsPersonalInfo = () => import(/* webpackChunkName: "beneficiaryProfile" */ '@/ui/views/Dashboard/Pages/AccountSettings/Components/AccountSettingsPersonalInfo.vue');
// const AccountSettingsPreferences = () => import(/* webpackChunkName: "beneficiaryProfile" */ '@/ui/views/Dashboard/Pages/AccountSettings/Components/AccountSettingsPreferences.vue');
//
// /* Financial Assistance */
// const DashboardFinancial = () => import(/* webpackChunkName: "financial" */ '@/ui/views/Dashboard/Pages/FinancialAssistance/Layout/FinancialAssistanceLayout.vue');
// const FinancialAssistanceTemplatesList = () => import(/* webpackChunkName: "financial" */ '@/ui/views/Dashboard/Pages/FinancialAssistance/Components/FinancialAssistanceTemplatesList.vue');
// const CreateEditFinancial = () => import(/* webpackChunkName: "financial" */ '@/ui/views/Dashboard/Pages/FinancialAssistance/Components/CreateEditFinancialAssistance/CreateEditFinancialAssistance.vue');
// const FinancialAssistanceDetails = () => import(/* webpackChunkName: "financial" */ '@/ui/views/Dashboard/Pages/FinancialAssistance/Components/FinancialAssistanceDetails.vue');
//
// /* Approval */
// const DashboardApproval = () => import(/* webpackChunkName: "approval" */ '@/ui/views/Dashboard/Pages/Approval/Layout/ApprovalLayout.vue');
// const ApprovalTemplatesList = () => import(/* webpackChunkName: "approval" */ '@/ui/views/Dashboard/Pages/Approval/Components/ApprovalTemplatesList.vue');
// const CreateEditApproval = () => import(/* webpackChunkName: "approval" */ '@/ui/views/Dashboard/Pages/Approval/Components/CreateEditApproval.vue');
// const ApprovalDetails = () => import(/* webpackChunkName: "approval" */ '@/ui/views/Dashboard/Pages/Approval/Components/ApprovalDetails.vue');
// const ApprovalRequests = () => import(/* webpackChunkName: "approval" */ '@/ui/views/Dashboard/Pages/Approval/Components/ApprovalRequests.vue');
//
// /* Mass Actions */
// const MassActionsLayout = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/Dashboard/Pages/MassActions/Layout/MassActionsLayout.vue');
// const MassActionsHome = () => import(/* webpackChunkName: "mass-actions" */ '@/ui/views/Dashboard/Pages/MassActions/Components/MassActionsHome.vue');
// /* Mass Actions Financial Assistance */
// const MassActionsFinancialAssistanceLayout = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/Dashboard/Pages/MassActions/Components/FinancialAssistance/Layout/FinancialAssistanceLayout.vue');
// const MassActionsFinancialAssistanceHome = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/Dashboard/Pages/MassActions/Components/FinancialAssistance/Components/FinancialAssistanceHome.vue');
// const MassActionsFinancialAssistanceDetail = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/Dashboard/Pages/MassActions/Components/FinancialAssistance/Components/FinancialAssistanceDetail.vue');
// const MassActionsFinancialAssistanceCreate = () => import(/* webpackChunkName: "financial-assistance" */ '@/ui/views/Dashboard/Pages/MassActions/Components/FinancialAssistance/Components/CreateFinancialAssistance.vue');

export const routes: Array<RouteConfig> = [
  {
    path: '/:lang',
    name: '',
    component: {
      render(c) { return c('router-view'); },
    },
    beforeEnter: Trans.routeMiddleware,
    children: [
      // {
      //   path: 'print-confirmation',
      //   name: 'print-confirmation',
      //   component: ConfirmationPrint,
      // },
      {
        path: '',
        redirect: { name: Routes.dashboard.name },
      },
      //   {
      //     path: Routes.selfRegistration.path,
      //     component: SelfRegistrationPortal,
      //     children: [{
      //       path: '',
      //       name: Routes.selfRegistration.name,
      //       redirect: { name: Routes.selfRegistrationLandingPage.name },
      //     }, {
      //       path: Routes.selfRegistrationLandingPage.path,
      //       name: Routes.selfRegistrationLandingPage.name,
      //       component: SelfRegistrationLandingPage,
      //     }, {
      //       path: Routes.selfRegistrationIndividual.path,
      //       name: Routes.selfRegistrationIndividual.name,
      //       component: SelfRegistrationIndividual,
      //     }],
      //   },
      {
        path: Routes.dashboard.path,
        component: PageNotFound,
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: '',
            name: Routes.dashboard.name,
            component: PageNotFound,
          },
        ],
      },
    //       {
    //         path: Routes.events.path,
    //         component: EventsLayout,
    //         children: [
    //           {
    //             path: '',
    //             name: Routes.events.name,
    //             component: HomeEvents,
    //             meta: { permissions: ['AccessEventManagementUI'] },
    //           },
    //           {
    //             path: Routes.createEvent.path,
    //             name: Routes.createEvent.name,
    //             component: CreateEditEvent,
    //             meta: { permissions: ['CreateEvent'] },
    //           },
    //           {
    //             path: Routes.editEvent.path,
    //             name: Routes.editEvent.name,
    //             component: CreateEditEvent,
    //             meta: { permissions: ['EditEvent'] },
    //           },
    //           {
    //             path: Routes.eventDetail.path,
    //             name: Routes.eventDetail.name,
    //             props: true,
    //             component: EventDetail,
    //             redirect: { name: Routes.eventDetailSummary.name },
    //             children: [
    //               {
    //                 path: Routes.eventDetailSummary.path,
    //                 name: Routes.eventDetailSummary.name,
    //                 component: EventSummary,
    //                 meta: { permissions: ['ViewEvent'] },
    //               },
    //               {
    //                 path: Routes.eventDetailPrograms.path,
    //                 name: Routes.eventDetailPrograms.name,
    //                 component: EventProgramList,
    //                 meta: { permissions: ['ViewEvent'] },
    //               },
    //               {
    //                 path: Routes.eventDetailCreateProgram.path,
    //                 name: Routes.eventDetailCreateProgram.name,
    //                 component: EventProgramForm,
    //                 meta: { permissions: ['CreateProgram'] },
    //               },
    //               {
    //                 path: Routes.eventDetailEditProgram.path,
    //                 name: Routes.eventDetailEditProgram.name,
    //                 component: EventProgramForm,
    //                 meta: { permissions: ['EditProgram'] },
    //                 props: true,
    //               },
    //               {
    //                 path: Routes.eventDetailViewProgram.path,
    //                 name: Routes.eventDetailViewProgram.name,
    //                 component: EventProgramDetails,
    //                 meta: { permissions: ['ViewProgram'] },
    //                 props: true,
    //               },
    //               {
    //                 path: Routes.eventDetailTeam.path,
    //                 name: Routes.eventDetailTeam.name,
    //                 component: EventTeams,
    //                 meta: { permissions: ['ViewEvent'] },
    //               },
    //               {
    //                 path: Routes.eventDetailAssessments.path,
    //                 name: Routes.eventDetailAssessments.name,
    //                 component: EventAssessments,
    //                 meta: { permissions: ['ViewEvent'] },
    //               },
    //               {
    //                 path: Routes.eventDetailBeneficiaries.path,
    //                 name: Routes.eventDetailBeneficiaries.name,
    //                 component: EventBeneficiaries,
    //                 meta: { permissions: ['ViewEvent'] },
    //               },
    //               {
    //                 path: Routes.eventDetailFinancialAssistance.path,
    //                 component: EventFinancial,
    //                 meta: { permissions: ['AccessEventFinancialAssistanceUI'] },
    //                 children: [{
    //                   path: '',
    //                   name: Routes.eventDetailFinancialAssistance.name,
    //                   component: FinancialAssistanceTablesList,
    //                   meta: { permissions: ['AccessEventFinancialAssistanceUI'] },
    //                 }, {
    //                   path: Routes.financial_table_create.path,
    //                   name: Routes.financial_table_create.name,
    //                   component: CreateEditFinancial,
    //                   meta: { permissions: ['AccessEventFinancialAssistanceUI'] },
    //                 }, {
    //                   path: Routes.financial_table_copy.path,
    //                   name: Routes.financial_table_copy.name,
    //                   component: CreateEditFinancial,
    //                   meta: { permissions: ['AccessEventFinancialAssistanceUI'] },
    //                 }, {
    //                   path: Routes.financial_table_edit.path,
    //                   name: Routes.financial_table_edit.name,
    //                   component: CreateEditFinancial,
    //                   meta: { permissions: ['AccessEventFinancialAssistanceUI'] },
    //                 }, {
    //                   path: Routes.financial_table_view.path,
    //                   name: Routes.financial_table_view.name,
    //                   component: FinancialAssistanceDetails,
    //                   meta: { permissions: ['AccessEventFinancialAssistanceUI'] },
    //                 }],
    //               },
    //               {
    //                 path: Routes.eventDetailApproval.path,
    //                 component: EventApprovals,
    //                 children: [{
    //                   path: '',
    //                   name: Routes.eventDetailApproval.name,
    //                   component: ApprovalTablesList,
    //                   meta: { permissions: ['AccessApprovalTablesPageUI'] },
    //                 }, {
    //                   path: Routes.approvals_table_create.path,
    //                   name: Routes.approvals_table_create.name,
    //                   component: CreateEditApproval,
    //                   meta: { permissions: ['CreateApprovalTable'] },
    //                 }, {
    //                   path: Routes.approvals_table_copy.path,
    //                   name: Routes.approvals_table_copy.name,
    //                   component: CreateEditApproval,
    //                   meta: { permissions: ['CreateApprovalTable'] },
    //                 }, {
    //                   path: Routes.approvals_table_details.path,
    //                   name: Routes.approvals_table_details.name,
    //                   component: ApprovalDetails,
    //                   meta: { permissions: ['ViewApprovalTable'] },
    //                 }],
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         path: Routes.teams.path,
    //         component: DashboardTeams,
    //         children: [
    //           {
    //             path: '',
    //             name: Routes.teams.name,
    //             component: TeamTable,
    //             meta: { permissions: ['AccessTeamManagementUI'] },
    //           },
    //           {
    //             path: Routes.teams_create.path,
    //             name: Routes.teams_create.name,
    //             component: CreateEditTeam,
    //             meta: { permissions: ['CreateTeam'] },
    //           }, {
    //             path: Routes.teams_edit.path,
    //             name: Routes.teams_edit.name,
    //             component: CreateEditTeam,
    //             meta: { permissions: ['EditTeam', 'EditTeamMember'] },
    //           }, {
    //             path: Routes.teams_detail.path,
    //             name: Routes.teams_detail.name,
    //             component: TeamDetail,
    //             meta: { permissions: ['ViewTeam'] },
    //           },
    //         ],
    //       },
    //       {
    //         path: Routes.financial.path,
    //         component: DashboardFinancial,
    //         children: [{
    //           path: '',
    //           name: Routes.financial.name,
    //           component: FinancialAssistanceTemplatesList,
    //           meta: { permissions: ['AccessFinancialAssistanceUI'] },
    //         },
    //         {
    //           path: Routes.financial_template_create.path,
    //           name: Routes.financial_template_create.name,
    //           component: CreateEditFinancial,
    //           meta: { permissions: ['AccessFinancialAssistanceUI'] },
    //         },
    //         {
    //           path: Routes.financial_template_copy.path,
    //           name: Routes.financial_template_copy.name,
    //           component: CreateEditFinancial,
    //         },
    //         {
    //           path: Routes.financial_template_view.path,
    //           name: Routes.financial_template_view.name,
    //           component: FinancialAssistanceDetails,
    //           meta: { permissions: ['AccessFinancialAssistanceUI'] },
    //         },
    //         {
    //           path: Routes.financial_template_edit.path,
    //           name: Routes.financial_template_edit.name,
    //           component: CreateEditFinancial,
    //           meta: { permissions: ['AccessFinancialAssistanceUI'] },
    //         }],
    //       },
    //       {
    //         path: Routes.assessments.path,
    //         name: Routes.assessments.name,
    //         component: DashboardAssessments,
    //         meta: { permissions: ['AccessAssessmentsPageUI'] },
    //       },
    //       {
    //         path: Routes.system_management.path,
    //         component: SystemManagementLayout,
    //         children: [
    //           {
    //             path: '/',
    //             name: Routes.system_management.name,
    //             component: HomeSystemManagement,
    //             meta: { permissions: ['AccessSystemManagementUI'] },
    //           },
    //           {
    //             path: Routes.system_management_lists.path,
    //             name: Routes.system_management_lists.name,
    //             component: OptionLists,
    //             meta: { permissions: ['AccessSystemManagementUI'] },
    //           }, {
    //             path: Routes.system_management_list.path,
    //             name: Routes.system_management_list.name,
    //             component: OptionListItems,
    //             props: true,
    //             meta: { permissions: ['AccessSystemManagementUI'] },
    //           }, {
    //             path: Routes.system_management_user_accounts.path,
    //             name: Routes.system_management_user_accounts.name,
    //             component: PageNotFound,
    //             meta: { permissions: ['AccessSystemManagementUI'] },
    //           }, {
    //             path: Routes.system_management_supported_languages.path,
    //             name: Routes.system_management_supported_languages.name,
    //             component: PageNotFound,
    //             meta: { permissions: ['AccessSystemManagementUI'] },
    //           }, {
    //             path: Routes.system_management_roles.path,
    //             name: Routes.system_management_roles.name,
    //             component: PageNotFound,
    //             meta: { permissions: ['AccessSystemManagementUI'] },
    //           },
    //         ],
    //       },
    //       {
    //         path: Routes.mass_actions.path,
    //         component: MassActionsLayout,
    //         meta: { permissions: ['AccessMassActionPageUI'] },
    //         children: [
    //           {
    //             path: '/',
    //             name: Routes.mass_actions.name,
    //             component: MassActionsHome,
    //             meta: { permissions: ['AccessMassActionPageUI'] },
    //           },
    //           {
    //             path: Routes.mass_actions_financial_assistance.path,
    //             component: MassActionsFinancialAssistanceLayout,
    //             meta: { permissions: ['AccessMassActionFinancialAssistanceUI'] },
    //             children: [
    //               {
    //                 path: '',
    //                 name: Routes.mass_actions_financial_assistance.name,
    //                 component: MassActionsFinancialAssistanceHome,
    //                 meta: { permissions: ['AccessMassActionFinancialAssistanceUI'] },
    //               },
    //               {
    //                 path: Routes.mass_actions_financial_assistance_create.path,
    //                 name: Routes.mass_actions_financial_assistance_create.name,
    //                 component: MassActionsFinancialAssistanceCreate,
    //                 meta: { permissions: ['AccessMassActionFinancialAssistanceUI'] },
    //               },
    //               {
    //                 path: Routes.mass_actions_financial_assistance_view.path,
    //                 name: Routes.mass_actions_financial_assistance_view.name,
    //                 component: MassActionsFinancialAssistanceDetail,
    //                 props: true,
    //                 meta: { permissions: ['AccessMassActionFinancialAssistanceUI'] },
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         path: Routes.reports.path,
    //         name: Routes.reports.name,
    //         component: DashboardReports,
    //         meta: { permissions: ['AccessReportPageUI'] },
    //       },
    //       {
    //         path: Routes.approvals.path,
    //         component: DashboardApproval,
    //         children: [{
    //           path: '',
    //           name: Routes.approvals.name,
    //           component: ApprovalTemplatesList,
    //           meta: { permissions: ['AccessApprovalTemplatesPageUI'] },
    //         },
    //         {
    //           path: Routes.approvals_create.path,
    //           name: Routes.approvals_create.name,
    //           component: CreateEditApproval,
    //           meta: { permissions: ['CreateApprovalTemplate'] },
    //         },
    //         {
    //           path: Routes.approvals_copy.path,
    //           name: Routes.approvals_copy.name,
    //           component: CreateEditApproval,
    //           meta: { permissions: ['CreateApprovalTemplate'] },
    //         },
    //         {
    //           path: Routes.approvals_details.path,
    //           name: Routes.approvals_details.name,
    //           component: ApprovalDetails,
    //           meta: { permissions: 'ViewApprovalTemplate' },
    //         },
    //         {
    //           path: Routes.approvals_requests.path,
    //           name: Routes.approvals_requests.name,
    //           component: ApprovalRequests,
    //           meta: { permissions: ['AccessApprovalRequestsPageUI'] },
    //         }],
    //       },
    //       {
    //         path: Routes.crc_registration.path,
    //         component: CRCRegistrationPortal,
    //         children: [{
    //           path: '',
    //           name: Routes.crc_registration.name,
    //           redirect: { name: Routes.crc_registration_landing_page.name },
    //         }, {
    //           path: Routes.crc_registration_landing_page.path,
    //           name: Routes.crc_registration_landing_page.name,
    //           component: CRCRegistrationLandingPage,
    //           meta: { permissions: ['AccessRegistrationUI'] },
    //         }, {
    //           path: Routes.crc_registration_individual.path,
    //           name: Routes.crc_registration_individual.name,
    //           component: CRCRegistrationIndividual,
    //           meta: { permissions: '[CreateCaseFile]' },
    //         }],
    //       },
    //       {
    //         path: Routes.caseFiles.path,
    //         component: CaseFileLayout,
    //         children: [
    //           {
    //             path: '',
    //             name: Routes.caseFiles.name,
    //             component: HomeCaseFile,
    //             meta: { permissions: ['AccessCaseFilePageUI'] },
    //           },
    //           {
    //             path: Routes.caseFileDetail.path,
    //             name: Routes.caseFileDetail.name,
    //             props: true,
    //             component: CaseFileDetail,
    //             redirect: { name: Routes.caseFileActivity.name },
    //             children: [
    //               {
    //                 path: Routes.caseFileActivity.path,
    //                 name: Routes.caseFileActivity.name,
    //                 component: CaseFileActivity,
    //                 meta: { permissions: ['ViewCaseFile'] },
    //               },
    //               {
    //                 path: Routes.caseNote.path,
    //                 name: Routes.caseNote.name,
    //                 component: CaseNotes,
    //                 meta: { permissions: ['ViewCaseNote'] },
    //               },
    //               {
    //                 path: Routes.caseFileTasks.path,
    //                 name: Routes.caseFileTasks.name,
    //                 component: PageNotFound,
    //                 meta: { permissions: ['AccessCaseFilePageUI'] },
    //               },
    //               {
    //                 path: Routes.caseFileDocuments.path,
    //                 name: Routes.caseFileDocuments.name,
    //                 component: PageNotFound,
    //                 meta: { permissions: ['AccessCaseFilePageUI'] },
    //               },
    //               {
    //                 path: Routes.caseFileFinancialAssistance.path,
    //                 name: Routes.caseFileFinancialAssistance.name,
    //                 component: TransactionsList,
    //                 meta: { permissions: ['ViewFinancialAssistanceSummary'] },
    //               },
    //               {
    //                 path: Routes.caseFileFinancialAssistanceCreate.path,
    //                 name: Routes.caseFileFinancialAssistanceCreate.name,
    //                 component: CreateTransaction,
    //                 meta: { permissions: ['CreateTransaction'] },
    //               }, {
    //                 path: Routes.caseFileFinancialAssistanceDetails.path,
    //                 name: Routes.caseFileFinancialAssistanceDetails.name,
    //                 component: TransactionDetails,
    //                 meta: { permissions: ['ViewFinancialAssistanceTransaction'] },
    //               }, {
    //                 path: Routes.caseFileFinancialAssistancePaymentLineDetails.path,
    //                 name: Routes.caseFileFinancialAssistancePaymentLineDetails.name,
    //                 component: PaymentLineDetails,
    //                 meta: { permissions: ['ViewFinancialAssistanceTransaction'] },
    //               },
    //               {
    //                 path: Routes.caseFileAssessments.path,
    //                 name: Routes.caseFileAssessments.name,
    //                 component: CaseFileAssessments,
    //                 meta: { permissions: ['AccessCaseFilePageUI'] },
    //               },
    //               {
    //                 path: Routes.caseFileReferrals.path,
    //                 name: Routes.caseFileReferrals.name,
    //                 component: ReferralsHome,
    //                 meta: { permissions: ['AccessCaseFilePageUI'] },
    //               },
    //               {
    //                 path: Routes.caseFileReferralsCreate.path,
    //                 name: Routes.caseFileReferralsCreate.name,
    //                 component: ReferralCreateEdit,
    //                 meta: { permissions: ['CreateReferral'] },
    //               },
    //               {
    //                 path: Routes.caseFileReferralsEdit.path,
    //                 name: Routes.caseFileReferralsEdit.name,
    //                 props: true,
    //                 component: ReferralCreateEdit,
    //                 meta: { permissions: ['EditReferral'] },
    //               },
    //               {
    //                 path: Routes.caseFileReferralsDetails.path,
    //                 name: Routes.caseFileReferralsDetails.name,
    //                 props: true,
    //                 component: ReferralDetails,
    //                 meta: { permissions: ['AccessCaseFilePageUI'] },
    //               },
    //               {
    //                 path: Routes.caseFileAssessments.path,
    //                 name: Routes.caseFileAssessments.name,
    //                 component: PageNotFound,
    //                 meta: { permissions: ['AccessCaseFilePageUI'] },
    //               },
    //             ],
    //           },
    //           {
    //             path: Routes.beneficiaryProfile.path,
    //             name: Routes.beneficiaryProfile.name,
    //             component: BeneficiaryProfileHome,
    //             props: true,
    //             meta: { permissions: ['AccessCaseFilePageUI'] },
    //             children: [
    //               {
    //                 path: Routes.beneficiaryProfileView.path,
    //                 name: Routes.beneficiaryProfileView.name,
    //                 component: BeneficiaryProfileView,
    //                 meta: { permissions: ['AccessCaseFilePageUI'] },
    //               },
    //               {
    //                 path: Routes.beneficiaryProfileEdit.path,
    //                 name: Routes.beneficiaryProfileEdit.name,
    //                 component: BeneficiaryProfileEdit,
    //                 meta: { permissions: ['AccessCaseFilePageUI'] },
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         path: Routes.accountSettings.path,
    //         name: Routes.accountSettings.name,
    //         component: AccountSettingsLayout,
    //         redirect: { name: Routes.accountSettingsPersonalInfo.name },
    //         children: [
    //           {
    //             path: Routes.accountSettingsPersonalInfo.path,
    //             name: Routes.accountSettingsPersonalInfo.name,
    //             component: AccountSettingsPersonalInfo,
    //           },
    //           {
    //             path: Routes.accountSettingsPreferences.path,
    //             name: Routes.accountSettingsPreferences.name,
    //             component: AccountSettingsPreferences,
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   {
    //     path: '*',
    //     name: 'PageNotFound',
    //     component: PageNotFound,
    //   },
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
