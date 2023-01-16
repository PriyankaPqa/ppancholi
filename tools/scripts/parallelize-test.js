/* eslint-disable no-console */
const jetpack = require('fs-jetpack');
const { getAffectedPackages, shellAsync } = require('./helpers');

/**
 * This script is used to test a slice of matching tests depending on total number of jobs and current job index
 */

const parameters = process.argv.slice(2);
const isPullRequest = parameters[0] === 'True';
const applicationName = parameters[1];

// Indicates the total number of slices. Should be 1-indexed
const JOB_TOTAL_COUNT = parameters[2] || 2;
// Identifies a particular slice. Should be 0-indexed, since System.JobPositionInPhase is 1-indexed we do minus 1
const JOB_INDEX = (parameters[3] - 1) || 0;

const unitTest = parameters[4] === 'unit';

console.log('###############');
console.log(`isPullRequest: ${isPullRequest}`);
console.log(`applicationName: ${applicationName}`);
console.log(`JOB_TOTAL_COUNT: ${JOB_TOTAL_COUNT}`);
console.log(`JOB_INDEX: ${JOB_INDEX}`);
console.log(`unitTest: ${unitTest}`);
console.log('###############');

if (isPullRequest === undefined || applicationName === undefined) {
  console.log(new Error('1st param should be isPullRequest. 2rd should be applicationName'));
  process.exit(1);
}

/**
 * Get affected test files slice
 * @param affectedPackages {string[]}
 * @returns {string[]}
 */
function getAffectedTestFiles(affectedPackages, globPattern) {
  let allFiles = [];

  console.log(`Affected packages: ${affectedPackages}`);

  if (affectedPackages.includes('@libs/shared-lib')) {
    allFiles = allFiles.concat(jetpack.find('libs/shared-lib', { matching: globPattern }));
  }

  if (affectedPackages.includes('@libs/stores-lib')) {
    allFiles = allFiles.concat(jetpack.find('libs/stores-lib', { matching: globPattern }));
  }

  if (affectedPackages.includes('@libs/entities-lib')) {
    allFiles = allFiles.concat(jetpack.find('libs/entities-lib', { matching: globPattern }));
  }

  if (affectedPackages.includes('@libs/registration-lib')) {
    allFiles = allFiles.concat(jetpack.find('libs/registration-lib', { matching: globPattern }));
  }

  if (affectedPackages.includes('@libs/component-lib')) {
    allFiles = allFiles.concat(jetpack.find('libs/component-lib', { matching: globPattern }));
  }

  if (affectedPackages.includes('@libs/services-lib')) {
    allFiles = allFiles.concat(jetpack.find('libs/services-lib', { matching: globPattern }));
  }

  if (affectedPackages.includes('@apps/benef-app') && applicationName === 'benef-app') {
    allFiles = allFiles.concat(jetpack.find('apps/benef-app', { matching: globPattern }));
  }

  if (affectedPackages.includes('@apps/emis-app') && applicationName === 'emis-app') {
    allFiles = allFiles.concat(jetpack.find('apps/emis-app', { matching: globPattern }));
  }

  const filesPerJob = Math.ceil(allFiles.length / JOB_TOTAL_COUNT);
  const startIndex = filesPerJob * JOB_INDEX;

  console.log(`JOB ${JOB_INDEX} will test ${filesPerJob} files between [${startIndex}; ${startIndex + filesPerJob}]`);

  return allFiles.slice(startIndex, startIndex + filesPerJob);
}

/**
 * Join the array of files into a single a new glob pattern which will match only selected files.
 * @param files {string[]}
 * @returns string
 */
function getBlobPattern(files) {
  // return files.map((str) => str.replace(/\//g, '\\/')).join('|');
  return files.map((str) => str).join('|');
}

const affectedPackages = getAffectedPackages(isPullRequest);

// The assumption is that all true unit test will follow spec.ts, component tests will be spec.js
const patternTestFiles = unitTest ? '*.spec.ts' : '*.{spec,test}.js';

const files = getAffectedTestFiles(affectedPackages, patternTestFiles);

if (files.length === 0) {
  console.log(`No file matches for pattern ${patternTestFiles}`);
  return;
}

const listOfFiles = getBlobPattern(files);

const script = `jest "${listOfFiles}" --coverage --coverageDirectory=coverage --runInBand --logHeapUsage`;

shellAsync(script)
  .then()
  .catch((exitCode) => process.exit(exitCode));
