const routes = {
  accountSettings: {
    home: {
      path: 'account',
      name: 'account',
    },
  },
  reporting: {
    home: {
      path: 'reporting',
      name: 'reporting.home',
    },
  },
  assessmentTemplates: {
    home: {
      path: 'assessment-templates',
      name: 'assessmenttemplates.home',
    },
    details: {
      path: 'assessment-templates/:assessmentTemplateId',
      name: 'assessmenttemplates.assessments.details',
    },
    create: {
      path: 'assessment-templates/create',
      name: 'assessmenttemplates.assessments.create',
    },
    duplicate: {
      path: 'assessment-templates/duplicate/:cloneId',
      name: 'assessmenttemplates.assessments.duplicate',
    },
    edit: {
      path: 'assessment-templates/:assessmentTemplateId/edit',
      name: 'assessmenttemplates.assessments.edit',
    },
    builder: {
      path: 'assessment-builder/:assessmentTemplateId',
      name: 'assessmenttemplates.builder',
    },
    runner: {
      path: 'assessment-runner/:assessmentTemplateId',
      name: 'assessmenttemplates.runner',
    },
  },
  approvals: {
    layout: {
      path: 'approvals',
      name: 'approvals.layout',
    },
    templates: {
      home: {
        path: 'templates',
        name: 'approvals.templates',
      },
      create: {
        path: 'templates/create',
        name: 'approvals.templates.create',
      },
    },
    request: {
      path: 'request',
      name: 'approvals.request',
    },
  },
  caseFile: {
    layout: {
      path: 'casefile',
      name: 'casefile.layout',
    },
    home: {
      path: '',
      name: 'casefile.home',
    },
    details: {
      path: ':id',
      name: 'casefile.details',
    },
    activity: {
      path: '',
      name: 'casefile.activity',
    },
    financialAssistance: {
      home: {
        path: 'financialAssistance',
        name: 'casefile.financialAssistance',
      },
      create: {
        path: 'financialAssistance/create',
        name: 'casefile.financialAssistance.create',
      },
      edit: {
        path: 'financialAssistance/:financialAssistancePaymentId/edit',
        name: 'casefile.financialAssistance.edit',
      },
      details: {
        path: 'financialAssistance/:financialAssistancePaymentId',
        name: 'casefile.financialAssistance.details',
      },
      paymentLineDetails: {
        path: 'financialAssistance/:financialAssistancePaymentId/line/:financialAssistancePaymentLineId',
        name: 'caseFile.financialAssistance.paymentLineDetails',
      },
    },
    note: {
      path: 'note',
      name: 'casefile.note',
    },
    referrals: {
      home: {
        path: 'referrals',
        name: 'casefile.referrals',
      },
      details: {
        path: 'referrals/:referralId',
        name: 'casefile.referrals.details',
      },
      edit: {
        path: 'referrals/:referralId/edit',
        name: 'casefile.referrals.edit',
      },
      add: {
        path: 'referrals/add',
        name: 'casefile.referrals.add',
      },
    },
    assessments: {
      home: {
        path: 'assessments',
        name: 'casefile.assessments',
      },
      details: {
        path: 'assessments/:assessmentResponseId',
        name: 'casefile.assessments.details',
      },
    },
    documents: {
      home: {
        path: 'documents',
        name: 'casefile.documents',
      },
      details: {
        path: 'documents/:documentId',
        name: 'casefile.documents.details',
      },
      edit: {
        path: 'documents/:documentId/edit',
        name: 'casefile.documents.edit',
      },
      add: {
        path: 'documents/add',
        name: 'casefile.documents.add',
      },
    },
    impactedIndividuals: {
      home: {
        path: 'impactedIndividuals',
        name: 'casefile.impactedIndividuals',
      },
    },
    task: {
      home: {
        path: 'task',
        name: 'casefile.task',
      },
      create: {
        path: 'task/create/:taskType',
        name: 'casefile.task.create',
      },
      edit: {
        path: 'task/edit/:taskType/:taskId',
        name: 'casefile.task.edit',
      },
      details: {
        path: 'task/:taskId',
        name: 'casefile.task.details',
      },
    },
  },
  events: {
    layout: {
      path: 'events',
      name: 'events.layout',
    },
    home: {
      path: '',
      name: 'events.home',
    },
    create: {
      path: 'create',
      name: 'events.create',
    },
    edit: {
      path: ':id/edit',
      name: 'events.edit',
    },
    details: {
      path: ':id',
      name: 'events.details',
    },
    summary: {
      path: '',
      name: 'events.summary',
    },
    summaryForIM: {
      path: '', // TODO EMISV2-6088
      name: 'events.summaryForIM', // Please remove this route when you remove the feature flag "letIMViewEventDetails"
    },
    financialAssistance: {
      home: {
        path: 'financial-assistance',
        name: 'events.financialAssistance.home',
      },
      create: {
        path: 'financial-assistance/create',
        name: 'events.financialAssistance.create',
      },
      edit: {
        path: 'financial-assistance/:faId/edit',
        name: 'events.financialAssistance.edit',
      },
      details: {
        path: 'financial-assistance/:faId',
        name: 'events.financialAssistance.details',
      },
    },
    approvals: {
      home: {
        path: 'approvals',
        name: 'events.approvals.home',
      },
      create: {
        path: 'approvals/create',
        name: 'events.approvals.create',
      },
      edit: {
        path: 'approvals/:approvalId/edit',
        name: 'events.approvals.edit',
      },
      details: {
        path: 'approvals/details/:approvalId',
        name: 'events.approvals.details',
      },
    },
    assessments: {
      home: {
        path: 'assessments',
        name: 'events.assessments.home',
      },
      details: {
        path: 'assessments/:assessmentTemplateId',
        name: 'events.assessments.details',
      },
      create: {
        path: 'assessments/create',
        name: 'events.assessments.create',
      },
      duplicate: {
        path: 'assessments/duplicate/:cloneId?',
        name: 'events.assessments.duplicate',
      },
      edit: {
        path: 'assessments/:assessmentTemplateId/edit',
        name: 'events.assessments.edit',
      },
      builder: {
        path: 'events/:id/assessment-builder/:assessmentTemplateId',
        name: 'events.assessments.builder',
      },
      runner: {
        path: 'events/:id/assessment-runner/:assessmentTemplateId',
        name: 'events.assessments.runner',
      },
      complete: {
        path: 'events/:id/assessment-complete/:assessmentTemplateId/:assessmentResponseId',
        name: 'events.assessments.complete',
      },
    },
  },
  household: {
    householdProfile: {
      path: 'household/:id',
      name: 'casefile.householdProfile',
    },
    householdSplit: {
      path: 'household/:id/split',
      name: 'casefile.householdSplit',
    },
    householdMembersMove: {
      path: 'household/:id/move',
      name: 'casefile.householdMembersMove',
    },
  },
  householdSearch: {
    path: 'household/search',
    name: 'householdSearch',
  },
  loginError: {
    path: 'login-error',
    name: 'Login error',
  },
  financialAssistance: {
    layout: {
      path: 'financial-assistance',
      name: 'financialAssistance.layout',
    },
    home: {
      path: '',
      name: 'financialAssistance.home',
    },
  },
  home: {
    path: 'home',
    name: 'home',
  },
  massActions: {
    layout: {
      path: 'mass-actions',
      name: 'massActions.layout',
    },
    home: {
      path: '',
      name: 'massActions.home',
    },
    financialAssistance: {
      home: {
        path: 'financial-assistance',
        name: 'massActions.financialAssistance.home',
      },
      create: {
        path: 'financial-assistance/create',
        name: 'massActions.financialAssistance.create',
      },
      details: {
        path: 'financial-assistance/details/:id',
        name: 'massActions.financialAssistance.details',
      },
    },
    financialAssistanceCustom: {
      home: {
        path: 'financial-assistance-custom',
        name: 'massActions.financialAssistanceCustom.home',
      },
      create: {
        path: 'financial-assistance-custom/create',
        name: 'massActions.financialAssistanceCustom.create',
      },
      details: {
        path: 'financial-assistance-custom/details/:id',
        name: 'massActions.financialAssistanceCustom.details',
      },
    },
    assessments: {
      home: {
        path: 'assessments',
        name: 'massActions.assessments.home',
      },
      create: {
        path: 'assessments/create',
        name: 'massActions.assessments.create',
      },
      details: {
        path: 'assessments/details/:id',
        name: 'massActions.assessments.details',
      },
    },
    importValidationStatus: {
      home: {
        path: 'import-validation-status',
        name: 'massActions.importValidationStatus.home',
      },
      create: {
        path: 'import-validation-status/create',
        name: 'massActions.importValidationStatus.create',
      },
      details: {
        path: 'import-validation-status/details/:id',
        name: 'massActions.importValidationStatus.details',
      },
    },
    importPaymentStatus: {
      home: {
        path: 'import-payment-status',
        name: 'massActions.importPaymentStatuses.home',
      },
      create: {
        path: 'import-payment-status/create',
        name: 'massActions.importPaymentStatuses.create',
      },
      details: {
        path: 'import-payment-status/details/:id',
        name: 'massActions.importPaymentStatuses.details',
      },
    },
    importUsers: {
      home: {
        path: 'import-users',
        name: 'massActions.importUsers.home',
      },
      create: {
        path: 'import-users/create',
        name: 'massActions.importUsers.create',
      },
      details: {
        path: 'import-users/details/:id',
        name: 'massActions.importUsers.details',
      },
    },
    fundingRequest: {
      home: {
        path: 'funding-request',
        name: 'massActions.fundingRequest.home',
      },
      create: {
        path: 'funding-request/create',
        name: 'massActions.fundingRequest.create',
      },
      details: {
        path: 'funding-request/details/:id',
        name: 'massActions.fundingRequest.details',
      },
    },
    dataCorrection: {
      home: {
        path: 'data-correction',
        name: 'massActions.dataCorrection.home',
      },
      create: {
        path: 'data-correction/create',
        name: 'massActions.dataCorrection.create',
      },
      details: {
        path: 'data-correction/details/:id',
        name: 'massActions.dataCorrection.details',
      },
    },
    caseFileStatus: {
      home: {
        path: 'case-file-status',
        name: 'massActions.caseFileStatus.home',
      },
      create: {
        path: 'case-file-status/create',
        name: 'massActions.caseFileStatus.create',
      },
      details: {
        path: 'case-file-status/details/:id',
        name: 'massActions.caseFileStatus.details',
      },
    },
  },
  programs: {
    home: {
      path: 'programs',
      name: 'programs.home',
    },
    create: {
      path: 'programs/create',
      name: 'programs.create',
    },
    details: {
      path: 'programs/:programId',
      name: 'programs.details',
    },
    edit: {
      path: 'programs/:programId/edit',
      name: 'programs.edit',
    },
  },
  registration: {
    layout: {
      path: 'registration',
      name: 'registration',
    },
    home: {
      path: '',
      name: 'registration.home',
    },
    individual: {
      path: 'individual',
      name: 'registration.individual',
    },
  },
  systemManagement: {
    layout: {
      path: 'system-management',
      name: 'systemManagement.layout',
    },
    home: {
      path: '',
      name: 'systemManagement.home',
    },
    lists: {
      path: 'lists',
      name: 'Lists',
    },
    caseFileTags: {
      path: 'lists/case-file-tags',
      name: 'systemManagement.lists.caseFileTags',
    },
    eventTypes: {
      path: 'lists/event-types',
      name: 'systemManagement.lists.eventTypes',
    },
    genders: {
      path: 'lists/genders',
      name: 'systemManagement.lists.genders',
    },
    preferredLanguages: {
      path: 'lists/preferred-languages',
      name: 'systemManagement.lists.preferredLanguages',
    },
    primarySpokenLanguages: {
      path: 'lists/primary-spoken-languages',
      name: 'systemManagement.lists.primarySpokenLanguages',
    },
    agreementTypes: {
      path: 'lists/agreement-types',
      name: 'systemManagement.lists.agreementTypes',
    },
    userAccounts: {
      home: {
        path: 'userAccounts',
        name: 'systemManagement.lists.userAccounts',
      },
      details: {
        path: 'userAccounts/details/:id',
        name: 'userAccounts.details',
      },
    },
    roles: {
      path: 'roles',
      name: 'systemManagement.lists.roles',
    },
    branding: {
      path: 'branding',
      name: 'systemManagement.lists.branding',
    },
    tenantSettings: {
      path: 'tenant-settings',
      name: 'systemManagement.lists.tenantSettings',
    },
    features: {
      path: 'features',
      name: 'systemManagement.lists.features',
    },
    caseFileInactiveReasons: {
      path: 'lists/case-file-inactive-reasons',
      name: 'systemManagement.lists.caseFileInactiveReasons',
    },
    caseNoteCategories: {
      path: 'lists/case-note-categories',
      name: 'systemManagement.lists.caseNoteCategories',
    },
    caseFileCloseReasons: {
      path: 'lists/case-file-close-reasons',
      name: 'systemManagement.lists.caseFileCloseReasons',
    },
    financialAssistance: {
      path: 'lists/financial-assistance',
      name: 'systemManagement.lists.financialAssistance',
    },
    referralOutcomeStatuses: {
      path: 'lists/referral-outcome-statuses',
      name: 'systemManagement.lists.referralOutcomeStatuses',
    },
    referralTypes: {
      path: 'lists/referral-types',
      name: 'systemManagement.lists.referralTypes',
    },
    screeningId: {
      path: 'lists/screening-id',
      name: 'systemManagement.lists.screeningId',
    },
    documentCategories: {
      path: 'lists/document-categories',
      name: 'systemManagement.lists.documentCategories',
    },
    exceptionalAuthenticationTypes: {
      path: 'lists/exceptional-authentication-types',
      name: 'systemManagement.lists.exceptionalAuthenticationTypes',
    },
    taskCategories: {
      path: 'lists/task-categories',
      name: 'systemManagement.lists.taskCategories',
    },
  },
  teams: {
    layout: {
      path: 'teams',
      name: 'teams.layout',
    },
    home: {
      path: '',
      name: 'teams.home',
    },
    create: {
      path: 'create/:teamType',
      name: 'teams.create',
    },
    edit: {
      path: 'edit/:teamType/:id',
      name: 'teams.edit',
    },
    details: {
      path: ':id',
      name: 'team.details',
    },
  },
  tasks: {
    home: {
      path: '',
      name: 'tasks.home',
    },
  },
};

export default routes;
