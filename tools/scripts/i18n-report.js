/* eslint-disable no-console */
const fs = require('fs');
const util = require('util');
const { exec } = require('child_process');

const execProm = util.promisify(exec);

// Include files having this extension
const EXTENSIONS = 'js,vue,ts';
const OUTPUT_PATH = './i18-report';

const parameters = process.argv.slice(2);
const SOURCE_FILES = parameters[0].split(','); // Loop through each keys contained in those files
const SEARCH_TARGET_FOLDER = parameters[1]; // Look for key usages in this folder

if (SOURCE_FILES === undefined || SEARCH_TARGET_FOLDER === undefined) {
  console.log(new Error('1st param should be SOURCE_FILES. 2nd should be SEARCH_TARGET_FOLDER'));
}

console.log('####');
console.log(`Will get all keys from ${SOURCE_FILES}`);
console.log(`Look for usage within: ${SEARCH_TARGET_FOLDER}`);
console.log('####');

function getLocaleKeys() {
  let keys = [];

  SOURCE_FILES.forEach((file) => {
    const data = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
    keys = keys.concat(Object.keys(JSON.parse(data)));
  });
  return keys;
}

async function findKeyInFile(key) {
  let res;
  try {
    const result = await execProm(`grep -l -Rw ${SEARCH_TARGET_FOLDER} -e "${key}" --include=*.{${EXTENSIONS}}`);
    res = result.stdout !== '';
  } catch (e) {
    res = (e.code === 1) ? false : 'error';
  }
  return { key, found: res };
}

async function report(from = -1, top = -1) {
  const unusedKeys = [];
  const usedKeys = [];
  const errors = [];

  let keysToSearch = getLocaleKeys();

  console.log(`Total keys ${keysToSearch.length}`);

  if (top !== -1 && from !== -1) {
    keysToSearch = keysToSearch.slice(from, top);
  }

  const promises = keysToSearch.map((key) => findKeyInFile(key));

  const results = await Promise.all(promises);

  results.forEach((r) => {
    if (r.found === false) {
      unusedKeys.push(r.key);
    }

    if (r.found === true) {
      usedKeys.push(r.key);
    }

    if (r.found === 'error') {
      errors.push(r.key);
    }
  });

  return { usedKeys, unusedKeys, errors };
}

report().then((res) => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdir(OUTPUT_PATH, (err) => {
      if (err) {
        throw err;
      }
    });
  }

  if (res.usedKeys.length > 0) {
    console.log(`Used keys ${res.usedKeys.length}`);
    fs.writeFileSync(`${OUTPUT_PATH}/used.txt`, res.usedKeys.join('\n'));
    // console.table(res.usedKeys);
  }

  if (res.unusedKeys.length > 0) {
    console.log(`Not used keys ${res.unusedKeys.length}`);
    fs.writeFileSync(`${OUTPUT_PATH}/not_used.txt`, res.unusedKeys.join('\n'));
    // console.table(res.unusedKeys);
  }
  if (res.errors.length > 0) {
    console.log(`Errors key ${res.errors.length}`);
    fs.writeFileSync(`${OUTPUT_PATH}/error.txt`, res.errors.join('\n'));
    // console.table(res.errors);
  }
  console.log(`Open the folder ${OUTPUT_PATH} to see the report`);
});
