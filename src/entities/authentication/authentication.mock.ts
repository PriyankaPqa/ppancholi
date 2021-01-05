export const authorizeResponse = {
  id: '1d296bf2-9d0b-468d-8e68-593bd5b653c4',
  firstName: 'Emmanuelle',
  lastName: 'Menard-Marchand',
  email: 'Emmanuelle.Marchand@Redcross.ca',
  isLoggedIn: true,
  roles: [{
    dashboardComponent: 'DashboardType6Layout',
    id: 'c05ae818-8c05-4636-9918-28a9742e41a4',
    name: { value: { en: 'System Admin', fr: 'System Admin-fr' } },
  }, {
    dashboardComponent: 'HomeCaseFiles',
    id: '052482d9-26f6-4621-b838-c2532cdb7eb4',
    name: { value: { en: 'Case Worker', fr: 'Case Worker-fr' } },
  }],
  currentRole: {
    dashboardComponent: 'HomeCaseFiles',
    id: '052482d9-26f6-4621-b838-c2532cdb7eb4',
    name: { value: { en: 'Case Worker', fr: 'Case Worker-fr' } },
  },
  dashboardComponent: 'HomeCaseFiles',
  invalidRoleError: false,
};

export const authenticationResponseData = {
  role: '',
  userId: '17cf032f-a10f-4d57-b5a2-45be29d4b419',
  firstName: 'Mister',
  lastName: 'Josh',
  email: 'test@redcross.ca',
  roles: [{
    name: 'Admin',
  }],
  permissions: [{
    name: 'Can test',
  }],
};
