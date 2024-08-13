import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';
import { UserRoles } from '@libs/entities-lib/user';

const SystemManagementLayout = () => import('@/ui/views/pages/system-management/layout/SystemManagementLayout.vue');
const SystemManagementHome = () => import('@/ui/views/pages/system-management/home/SystemManagementHome.vue');
const SystemManagementLists = () => import('@/ui/views/pages/system-management/lists/SystemManagementLists.vue');
const CaseFileTags = () => import('@/ui/views/pages/system-management/lists/pages/CaseFileTagsList.vue');
const EventTypes = () => import('@/ui/views/pages/system-management/lists/pages/EventTypes.vue');
const Genders = () => import('@/ui/views/pages/system-management/lists/pages/Genders.vue');
const PreferredLanguages = () => import('@/ui/views/pages/system-management/lists/pages/PreferredLanguages.vue');
const PrimarySpokenLanguages = () => import('@/ui/views/pages/system-management/lists/pages/PrimarySpokenLanguages.vue');
const AgreementTypes = () => import('@/ui/views/pages/system-management/lists/pages/AgreementTypes.vue');
const CaseFileInactiveReasons = () => import('@/ui/views/pages/system-management/lists/pages/CaseFileInactiveReasons.vue');
const UserAccounts = () => import('@/ui/views/pages/system-management/lists/user-accounts/home/UserAccounts.vue');
const AccountSettings = () => import('@/ui/views/pages/system-management/lists/user-accounts/account-settings/AccountSettings.vue');
const Roles = () => import('@/ui/views/pages/system-management/lists/Roles.vue');
const Branding = () => import('@/ui/views/pages/system-management/lists/branding/Branding.vue');
const TenantSettings = () => import('@/ui/views/pages/system-management/lists/tenantSettings/TenantSettings.vue');
const FeaturesComponent = () => import('@/ui/views/pages/system-management/lists/features/Features.vue');
const MultiTenantFeatures = () => import('@/ui/views/pages/system-management/lists/multi-tenant-features/MultiTenantFeatures.vue');
const MultiTenantFeaturesCreateEditFeature = () => import('@/ui/views/pages/system-management/lists/multi-tenant-features/CreateEditFeature.vue');
const CaseNoteCategories = () => import('@/ui/views/pages/system-management/lists/pages/CaseNoteCategories.vue');
const CaseFileCloseReasons = () => import('@/ui/views/pages/system-management/lists/pages/CaseFileCloseReasons.vue');
const ReferralOutcomeStatuses = () => import('@/ui/views/pages/system-management/lists/pages/ReferralOutcomeStatuses.vue');
const ReferralTypes = () => import('@/ui/views/pages/system-management/lists/pages/ReferralTypes.vue');
const FinancialAssistanceItems = () => import('@/ui/views/pages/system-management/lists/pages/FinancialAssistance.vue');
const ScreeningId = () => import('@/ui/views/pages/system-management/lists/pages/ScreeningId.vue');
const DocumentCategories = () => import('@/ui/views/pages/system-management/lists/pages/DocumentCategories.vue');
const ExceptionalAuthenticationTypes = () => import('@/ui/views/pages/system-management/lists/pages/ExceptionalAuthenticationTypes.vue');
const TaskCategories = () => import('@/ui/views/pages/system-management/lists/pages/TaskCategories.vue');
const AppointmentModalities = () => import('@/ui/views/pages/system-management/lists/pages/AppointmentModalities.vue');
const ServiceOptionTypes = () => import('@/ui/views/pages/system-management/lists/pages/ServiceOptionTypes.vue');

export const systemManagement: RouteConfig = {
  path: Routes.systemManagement.layout.path,
  component: SystemManagementLayout,
  meta: {
    requiresAuthorization: true,
  },
  children: [
    {
      path: Routes.systemManagement.home.path,
      name: Routes.systemManagement.home.name,
      component: SystemManagementHome,
      meta: { level: UserRoles.level5 },
    },
    {
      path: Routes.systemManagement.lists.path,
      name: Routes.systemManagement.lists.name,
      component: SystemManagementLists,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.caseFileTags.path,
      name: Routes.systemManagement.caseFileTags.name,
      component: CaseFileTags,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.eventTypes.path,
      name: Routes.systemManagement.eventTypes.name,
      component: EventTypes,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.genders.path,
      name: Routes.systemManagement.genders.name,
      component: Genders,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.preferredLanguages.path,
      name: Routes.systemManagement.preferredLanguages.name,
      component: PreferredLanguages,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.primarySpokenLanguages.path,
      name: Routes.systemManagement.primarySpokenLanguages.name,
      component: PrimarySpokenLanguages,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.agreementTypes.path,
      name: Routes.systemManagement.agreementTypes.name,
      component: AgreementTypes,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.caseFileInactiveReasons.path,
      name: Routes.systemManagement.caseFileInactiveReasons.name,
      component: CaseFileInactiveReasons,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.userAccounts.home.path,
      name: Routes.systemManagement.userAccounts.home.name,
      component: UserAccounts,
      meta: { level: UserRoles.level5 },
    },
    {
      path: Routes.systemManagement.userAccounts.details.path,
      name: Routes.systemManagement.userAccounts.details.name,
      component: AccountSettings,
      meta: { level: UserRoles.level5 },
    },
    {
      path: Routes.systemManagement.roles.path,
      name: Routes.systemManagement.roles.name,
      component: Roles,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.branding.path,
      name: Routes.systemManagement.branding.name,
      component: Branding,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.tenantSettings.path,
      name: Routes.systemManagement.tenantSettings.name,
      component: TenantSettings,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.features.path,
      name: Routes.systemManagement.features.name,
      component: FeaturesComponent,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.multiTenantFeatures.home.path,
      name: Routes.systemManagement.multiTenantFeatures.home.name,
      component: MultiTenantFeatures,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.multiTenantFeatures.create.path,
      name: Routes.systemManagement.multiTenantFeatures.create.name,
      component: MultiTenantFeaturesCreateEditFeature,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.multiTenantFeatures.edit.path,
      name: Routes.systemManagement.multiTenantFeatures.edit.name,
      component: MultiTenantFeaturesCreateEditFeature,
      meta: { level: UserRoles.level6 },
      props: true,
    },
    {
      path: Routes.systemManagement.caseNoteCategories.path,
      name: Routes.systemManagement.caseNoteCategories.name,
      component: CaseNoteCategories,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.caseFileCloseReasons.path,
      name: Routes.systemManagement.caseFileCloseReasons.name,
      component: CaseFileCloseReasons,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.referralOutcomeStatuses.path,
      name: Routes.systemManagement.referralOutcomeStatuses.name,
      component: ReferralOutcomeStatuses,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.referralTypes.path,
      name: Routes.systemManagement.referralTypes.name,
      component: ReferralTypes,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.financialAssistance.path,
      name: Routes.systemManagement.financialAssistance.name,
      component: FinancialAssistanceItems,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.screeningId.path,
      name: Routes.systemManagement.screeningId.name,
      component: ScreeningId,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.documentCategories.path,
      name: Routes.systemManagement.documentCategories.name,
      component: DocumentCategories,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.exceptionalAuthenticationTypes.path,
      name: Routes.systemManagement.exceptionalAuthenticationTypes.name,
      component: ExceptionalAuthenticationTypes,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.taskCategories.path,
      name: Routes.systemManagement.taskCategories.name,
      component: TaskCategories,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.appointmentModalities.path,
      name: Routes.systemManagement.appointmentModalities.name,
      component: AppointmentModalities,
      meta: { level: UserRoles.level6 },
    },
    {
      path: Routes.systemManagement.serviceOptionTypes.path,
      name: Routes.systemManagement.serviceOptionTypes.name,
      component: ServiceOptionTypes,
      meta: { level: UserRoles.level6 },
    },
  ],
};
