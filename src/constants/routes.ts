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
    details: {
      path: ':id',
      name: 'events.details',
    },
    edit: {
      path: ':id/edit',
      name: 'events.edit',
    },
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
  home: {
    path: 'home',
    name: 'home',
  },
  loginError: {
    path: 'login-error',
    name: 'Login error',
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
    roles: {
      path: 'roles',
      name: 'systemManagement.lists.roles',
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
