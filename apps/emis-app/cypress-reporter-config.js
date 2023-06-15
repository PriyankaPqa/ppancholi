require('dotenv').config({ path: `${__dirname}/../../.env.local`, override: true });

const spiraReporter = process.env.SPIRA !== 'false';

const reporterEnabled = [
  'spec',
  'mocha-junit-reporter',
];

const spiraConfig = {
  projectId: 5,
  testSetId: 57,
  login: process.env.SPIRA_USERNAME,
  apiKey: process.env.SPIRA_TOKEN,
  protocol: 'https',
  host: process.env.SPIRA_HOST,
  vdir: '',
  autoMapping: true,
};

const finalConfig = {
  reporterEnabled,
  mochaJunitReporterReporterOptions: {
    mochaFile: 'cypress/results/results-[hash].xml',
  },
};

if (spiraReporter) {
  reporterEnabled.push('../../libs/cypress-lib/src/reporter/SpiraReporter');
  finalConfig.libsCypressLibSrcReporterSpiraReporterReporterOptions = spiraConfig;
}

module.exports = {
  ...finalConfig,
};
