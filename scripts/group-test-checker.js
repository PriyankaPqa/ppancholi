/*
 * This script will scan all test.js, test.ts, spec.ts, spec.js, and detect files with no @group
 *
 */
/* eslint-disable no-console */
const util = require('util');

const { exec } = require('child_process');

const execProm = util.promisify(exec);

const SEARCH_TARGET_FOLDER = './src';

const validGroups = [
  'entities',
  'services',
  'store',
  'storage',
  'ui/mixins',
  'ui/helpers',
  'ui/plugins',
  'ui/shared-components',
  'ui/components/layout',
  'ui/components/approvals',
  'ui/components/assessments',
  'ui/components/case-file',
  'ui/components/events',
  'ui/components/financial-assistance',
  'ui/components/home',
  'ui/components/household',
  'ui/components/mass-action',
  'ui/components/programs',
  'ui/components/registration',
  'ui/components/shared-components',
  'ui/components/system-management',
  'ui/components/others',
  'ui/components/teams',
];

function getGrepFindPattern() {
  return validGroups.map((group) => `@group ${group}`).join('|');
}

/**
 * Get a list of files with spec.ts, spec.js, test.js, test.ts within target folder
 */
async function getAllTestFiles() {
  try {
    // eslint-disable-next-line max-len
    const result = await execProm(`find "${SEARCH_TARGET_FOLDER}" -type f '(' -name "*.spec.ts" -o -name "*.spec.js" -o -name "*.test.js" -o -name "*.spec.js" ')'`);
    return result.stdout.split('\n').filter((file) => file !== '');
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Try to find exact multiple keys (-E -w) within a file
 * @param keys
 * @param filePath
 */
async function findMultipleKeysInFile(keys, filePath) {
  let res;
  try {
    const result = await execProm(`grep -E -w "${keys}" ${filePath}`);
    res = result.stdout !== '';
  } catch (e) {
    res = (e.code === 1) ? false : 'error';
  }
  return { filePath, found: res };
}

getAllTestFiles().then(async (testFiles) => {
  if (testFiles.length > 0) {
    const groups = getGrepFindPattern();
    const promises = testFiles.map((filePath) => findMultipleKeysInFile(groups, filePath));
    const results = await Promise.all(promises);
    const filesWithIssues = results
      .filter((res) => res.found === false)
      .map((res) => res.filePath);

    if (filesWithIssues.length > 0) {
      console.warn('Issues with @group. Make sure there is one or it is one of the valid ones:');
      console.table(validGroups.map((group) => `@group ${group}`));
      console.warn('Please fix:');
      console.table(filesWithIssues);
      throw new Error('@group attribute missing or invalid');
    }
  }
});
