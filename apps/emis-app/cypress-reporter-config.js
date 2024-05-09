require('dotenv').config({ path: `${__dirname}/../../.env.local`, override: true });

const zephyrReporter = process.env.ZEPHYR_REPORTER !== 'false';

const reporterEnabled = [
  'spec',
  'mocha-junit-reporter',
];

const getTestCycleName = () => {
  if (process.env.BUILD_DEFINITIONNAME && process.env.BUILD_BUILDNUMBER) {
    return `Cypress - ${process.env.BUILD_DEFINITIONNAME} - ${process.env.BUILD_BUILDNUMBER} - [${new Date().toUTCString()}] `;
  }
  return `Cypress run - [${new Date().toUTCString()}]`;
};

const zephyrConfig = {
  projectKey: 'EMISV2',
  authorizationToken: process.env.ZEPHYR_AUTHORIZATION_TOKEN,
  testCycle: {
    name: getTestCycleName(),
    description: 'This is a test cycle created by Cypress automated tests.',
  },
};

const finalConfig = {
  reporterEnabled,
  mochaJunitReporterReporterOptions: {
    mochaFile: 'cypress/results/results-[hash].xml',
  },
};

if (zephyrReporter) {
  reporterEnabled.push('cypress-zephyr');
  finalConfig.cypressZephyrReporterOptions = zephyrConfig;
}

module.exports = {
  ...finalConfig,
};
