const routes = {
  home: {
    path: 'home',
    name: 'home',
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
  loginError: {
    path: 'login-error',
    name: 'Login error',
  },
};

export default routes;
