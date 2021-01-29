const routes = {
  approvals: {
    layout: {
      path: 'approvals',
      name: 'approvals.layout',
    },
    home: {
      path: '',
      name: 'approvals.home',
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
      path: 'edit',
      name: 'events.edit',
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
  teams: {
    layout: {
      path: 'teams',
      name: 'teams.layout',
    },
    home: {
      path: '',
      name: 'teams.home',
    },
  },
};

export default routes;
