module.exports = {
  reporterEnabled: [
    'spec',
    'mocha-junit-reporter',
    '../../libs/cypress-lib/src/reporter/SpiraReporter',
  ],
  libsCypressLibSrcReporterSpiraReporterReporterOptions: {
    projectId: 5,
    testSetId: 57,
    login: process.env.SPIRA_USERNAME,
    apiKey: process.env.SPIRA_TOKEN,
    protocol: 'https',
    host: process.env.SPIRA_HOST,
    vdir: '',
    autoMapping: true,
  },
  mochaJunitReporterReporterOptions: {
    mochaFile: 'cypress/results/results-[hash].xml',
  },
};
