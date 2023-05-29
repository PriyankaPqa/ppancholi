module.exports = {
  e2e: {
    batchSize: 3, // how many specs to send in one batch
  },
  component: {
    batchSize: 5, // how many specs to send in one batch
  },
  projectId: process.env.CYPRESS_EMIS_PROJECT_ID, // defined in each pipelines variables to have different projects depending on tests type
  cloudServiceUrl: 'https://cy.currents.dev',
};
