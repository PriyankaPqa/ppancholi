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
    note: {
      path: 'note',
      name: 'casefile.note',
    },
    householdProfile: {
      path: 'household/:id',
      name: 'casefile.householdProfile',
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
  reports: {
    layout: {
      path: 'reports',
      name: 'reports.layout',
    },
    home: {
      path: '',
      name: 'reports.home',
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
