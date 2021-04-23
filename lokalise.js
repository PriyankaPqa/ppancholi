/* eslint-disable import/no-extraneous-dependencies */
//  https://github.com/lokalise/node-lokalise-api#installation
const unzipper = require('unzipper');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { LokaliseApi } = require('@lokalise/node-api');

const API_KEY_READ_WRITE = '012f35ddfa553d3fe3839189b37cb6bc320ea268';
const EMIS_PROJECT_ID = '955065625d9745a35c6f72.71379721';
const REGISTRATION_PROJECT_ID = '495058395f5240e2843ef1.45815308';
const LANG_FOLDER_PATH = 'src/ui/lang';

const lokaliseApi = new LokaliseApi({ apiKey: API_KEY_READ_WRITE });

function down(id, prefix = '') {
  lokaliseApi.files.download(id, {
    format: 'json',
    bundle_structure: prefix ? `${prefix}.%LANG_ISO%.json` : '%LANG_ISO%.json',
    original_filenames: false,
    placeholder_format: 'icu', // Placeholder will be converted to be used with our app
    replace_breaks: false,
  }).then((data) => {
    // DOWNLOAD A ZIP OF TRANSLATIONS
    https.get(data.bundle_url, (response) => {
      response.pipe(unzipper.Extract({ path: LANG_FOLDER_PATH }));
    });
  });
}

// https://lokalise.com/api2docs/curl/#transition-upload-a-file-post
// If the language does not exist in Lokalise, need to be created first in the project
const uploadToLokalise = (base64File, fileName, langISO, tags) => new Promise((resolve, reject) => {
  const replaceModified = false;
  const tagUpdatedKeys = replaceModified;
  lokaliseApi.files.upload(EMIS_PROJECT_ID, {
    data: base64File,
    filename: fileName, // fr.json, en.json, ....
    lang_iso: langISO, // fr, en, it, jp, ...
    replace_modified: replaceModified, // Enable to replace translations, that have been modified (in the file being uploaded).
    tag_updated_keys: tagUpdatedKeys,
    tag_skipped_keys: false,
    convert_placeholder: true, // Placeholder will be converted to a universal used by Lokalise
    tags,
    apply_tm: false,
  }).then((response) => {
    resolve(response);
  }).catch((error) => {
    reject(error);
  });
});

const getAllErrors = () => new Promise((resolve, reject) => {
  let errors = {};

  https.get('https://emis-api-common-dev.azurewebsites.net/api-error-templates', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      errors = JSON.parse(data);
      resolve(errors);
    });
  }).on('error', (err) => {
    reject(err.message);
  });
});

async function uploadErrors() {
  const finalObject = {};

  const errors = await getAllErrors();

  // eslint-disable-next-line no-restricted-syntax,no-unused-vars
  for (const [key, error] of Object.entries(errors)) {
    finalObject[error.code] = error.detail || error.message;
  }

  const encoded = Buffer.from(JSON.stringify(finalObject)).toString('base64');

  await uploadToLokalise(encoded, 'en.json', 'en', ['ERRORS']);
}

async function up() {
  // We will upload all files contained in the lang folder
  const files = fs.readdirSync(LANG_FOLDER_PATH);
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const langISO = path.parse(file).name;
    if (langISO.includes('registration')) {
      return;
    }
    const base64File = fs.readFileSync(`${LANG_FOLDER_PATH}/${file}`, { encoding: 'base64' });
    try {
      // Each loop iteration is delayed until upload operation is completed because Lokalise does not support // requests.
      /* eslint-disable no-await-in-loop */
      await uploadToLokalise(base64File, file, langISO, ['DEV']);
    } catch (e) {
      throw new Error(e);
    }
  }
}

for (let i = 0; i < process.argv.length; i += 1) {
  switch (process.argv[i]) {
    case 'down':
      down(EMIS_PROJECT_ID);
      down(REGISTRATION_PROJECT_ID, 'registration');
      break;
    case 'up':
      up();
      break;
    case 'upErrors':
      uploadErrors();
      break;
    default:
      break;
  }
}

module.exports.down = down;
module.exports.up = up;
module.exports.uploadErrors = uploadErrors;
