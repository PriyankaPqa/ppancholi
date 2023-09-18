const routes = {
  registration: {
    path: 'registration/:registrationLink',
    name: 'registration',
  },
  authenticationLink: {
    path: 'tier2/:eventId/:caseFileId',
    name: 'authenticationLink',
  },
  landingPage: {
    path: '',
    name: 'landingPage.name',
  },
  individual: {
    path: 'individual',
    name: 'individual.name',
  },
  assessmentRunner: {
    path: 'assessment/:eventId/:assessmentTemplateId/:assessmentResponseId',
    name: 'assessmentRunner',
  },
};

export default routes;
