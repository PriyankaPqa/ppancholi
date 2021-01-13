const routes = {
  selfRegistration: {
    path: 'registration/:eventPath',
    name: 'Home',
  },
  selfRegistrationLandingPage: {
    path: '',
    name: 'Self Registration Landing Page',
  },
  selfRegistrationIndividual: {
    path: 'individual',
    name: 'Self Registration - Individual',
  },
  dashboard: {
    path: 'dashboard',
    name: 'Dashboard',
  },
  loginError: {
    path: 'login-error',
    name: 'Login error',
  },
  crc_registration: {
    path: 'registration',
    name: 'CRC Registration',
  },
  crc_registration_landing_page: {
    path: '',
    name: 'CRC Registration Landing Page',
  },
  crc_registration_individual: {
    path: 'individual',
    name: 'CRC Registration - Family or individual',
  },
  events: {
    path: 'events',
    name: 'Events',
  },
  eventDetail: {
    path: ':id',
    name: 'Event Detail',
  },
  createEvent: {
    path: 'create',
    name: 'createEvent',
  },
  editEvent: {
    path: 'edit/:eventId',
    name: 'editEvent',
  },
  teams: {
    path: 'teams',
    name: 'Teams',
  },
  teams_create: {
    path: 'create/:teamType',
    name: 'Teams Create',
  },
  teams_edit: {
    path: 'edit/:id',
    name: 'Teams Edit',
  },
  teams_list: {
    path: 'list',
    name: 'Teams List',
  },
  teams_detail: {
    path: 'detail/:id',
    name: 'Team Detail',
  },
  financial: {
    path: 'financial',
    name: 'Financial',
  },
  financial_template_create: {
    path: 'create',
    name: 'Create Financial Template',
  },
  financial_template_copy: {
    path: 'copy',
    name: 'Copy Financial Template',
  },
  financial_template_edit: {
    path: ':financialTemplateId/edit',
    name: 'Edit Financial Template Details',
  },
  financial_template_view: {
    path: ':financialTemplateId',
    name: 'View Financial Template Details',
  },
  financial_table_create: {
    path: 'create',
    name: 'Create financial table',
  },
  financial_table_copy: {
    path: 'copy',
    name: 'Copy financial table',
  },
  financial_table_edit: {
    path: ':financialTableId/edit',
    name: 'Edit Financial Table Details',
  },
  financial_table_view: {
    path: ':financialTableId',
    name: 'View Financial Table Details',
  },
  approvals: {
    path: 'approval',
    name: 'approval',
  },
  approvals_requests: {
    path: 'requests',
    name: 'Approvals requests',
  },
  approvals_create: {
    path: 'create',
    name: 'Create Approval',
  },
  approvals_copy: {
    path: 'copy',
    name: 'Copy Approval',
  },
  approvals_edit: {
    path: 'edit',
    name: 'Edit Approval',
  },
  approvals_details: {
    path: ':approvalId',
    name: 'Approval Details',
  },
  approvals_table_create: {
    path: 'create',
    name: 'Create approval table',
  },
  approvals_table_copy: {
    path: 'copy',
    name: 'Copy approval table',
  },
  approvals_table_details: {
    path: ':approvalId',
    name: 'Approval table details',
  },
  assessments: {
    path: 'assessments',
    name: 'Assessments',
  },
  system_management: {
    path: 'system-management',
    name: 'System Management',
  },
  system_management_lists: {
    path: 'lists',
    name: 'Lists',
  },
  system_management_list: {
    path: 'lists/:id',
    name: 'List',
  },
  system_management_user_accounts: {
    path: 'user-accounts',
    name: 'User accounts',
  },
  system_management_supported_languages: {
    path: 'supported-languages',
    name: 'Supported languages',
  },
  system_management_roles: {
    path: 'roles',
    name: 'Roles',
  },
  mass_actions: {
    path: 'mass-actions',
    name: 'Mass Actions',
  },
  mass_actions_financial_assistance: {
    path: 'financial',
    name: 'Mass Financial Assistance',
  },
  mass_actions_financial_assistance_create: {
    path: 'create',
    name: 'Create Mass Financial Assistance Payment',
  },
  mass_actions_financial_assistance_view: {
    path: ':financialPaymentId',
    name: 'Mass Financial Assistance Payment Detail',
  },
  reports: {
    path: 'reports',
    name: 'Reports',
  },
  caseFiles: {
    path: 'casefiles',
    name: 'Case Files',
  },
  caseFileDetail: {
    path: ':id',
    name: 'Case File Detail',
  },
  caseFileActivity: {
    path: 'activity',
    name: 'Case File Activity',
  },
  caseNote: {
    path: 'notes',
    name: 'Case Note',
  },
  caseFileTasks: {
    path: 'tasks',
    name: 'Case File Tasks',
  },
  caseFileDocuments: {
    path: 'documents',
    name: 'Case File Documents',
  },
  caseFileFinancialAssistance: {
    path: 'financial',
    name: 'Case File assistance',
  },
  caseFileFinancialAssistanceCreate: {
    path: 'financial/create',
    name: 'Case File assistance create',
  },
  caseFileFinancialAssistanceDetails: {
    path: 'financial/:transactionId',
    name: 'Case File assistance details',
  },
  caseFileFinancialAssistancePaymentLineDetails: {
    path: 'financial/:transactionId/:paymentLineId',
    name: 'Case File assistance payment line details',
  },
  caseFileAssessments: {
    path: 'assessments',
    name: 'Case File assessments',
  },
  caseFileReferrals: {
    path: 'referrals',
    name: 'Case File referrals',
  },
  beneficiaryProfile: {
    path: 'beneficiary/',
    name: 'Beneficiary Profile',
  },
  beneficiaryProfileView: {
    path: ':beneficiaryId',
    name: 'Beneficiary Profile - View',
  },
  beneficiaryProfileEdit: {
    path: ':beneficiaryId/edit',
    name: 'Beneficiary Profile - Edit',
  },
  eventDetailSummary: {
    path: 'summary',
    name: 'Event Summary',
  },
  eventDetailTeam: {
    path: 'teams',
    name: 'Team Management',
  },
  eventDetailPrograms: {
    path: 'programs',
    name: 'Programs Management',
  },
  eventDetailCreateProgram: {
    path: 'programs/create',
    name: 'createProgram',
  },
  eventDetailEditProgram: {
    path: 'programs/:programId/edit',
    name: 'editProgram',
  },
  eventDetailViewProgram: {
    path: 'programs/:programId',
    name: 'viewProgram',
  },
  eventDetailFinancialAssistance: {
    path: 'financial',
    name: 'Financial assistance',
  },
  eventDetailApproval: {
    path: 'approval',
    name: 'Approval',
  },
  eventDetailAssessments: {
    path: 'assessments',
    name: 'Event Assessments',
  },
  eventDetailBeneficiaries: {
    path: 'beneficiaries',
    name: 'Beneficiaries',
  },
  caseFileReferralsCreate: {
    path: 'referrals/create',
    name: 'Case File referrals create',
  },
  caseFileReferralsEdit: {
    path: 'referrals/:referralId/edit',
    name: 'Case File referrals edit',
  },
  caseFileReferralsDetails: {
    path: 'referrals/:referralId/details',
    name: 'Case File referrals details',
  },
  accountSettings: {
    path: 'settings',
    name: 'Account Settings',
  },
  accountSettingsPersonalInfo: {
    path: 'personal-info',
    name: 'Account Settings Personal Info',
  },
  accountSettingsPreferences: {
    path: 'preferences',
    name: 'Account Settings Preferences',
  },
};

export default routes;
