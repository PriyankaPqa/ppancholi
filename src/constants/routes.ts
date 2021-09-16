const routes = {
  accountSettings: {
    home: {
      path: 'account',
      name: 'account',
    },
  },
  assessments: {
    layout: {
      path: 'assessments',
      name: 'assessments.layout',
    },
    home: {
      path: '',
      name: 'assessments.home',
    },
  },
  approvals: {
    layout: {
      path: 'approvals',
      name: 'approvals.layout',
    },
    templates: {
      path: 'templates',
      name: 'approvals.templates',
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
  },
  household: {
    householdProfile: {
      path: 'household/:id',
      name: 'casefile.householdProfile',
    },
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
};

export default routes;
