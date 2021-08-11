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
const LANG_FOLDER_PATH_EMIS = 'src/ui/lang/emis';
const LANG_FOLDER_PATH_REGISTRATION = 'src/ui/lang/registration';

const lokaliseApi = new LokaliseApi({ apiKey: API_KEY_READ_WRITE });

function down(projectId, path) {
  lokaliseApi.files.download(projectId, {
    format: 'json',
    bundle_structure: '%LANG_ISO%.json',
    original_filenames: false,
    placeholder_format: 'icu', // Placeholder will be converted to be used with our app
    replace_breaks: false,
  }).then((data) => {
    // DOWNLOAD A ZIP OF TRANSLATIONS
    https.get(data.bundle_url, (response) => {
      response.pipe(unzipper.Extract({ path }));
    });
  });
}

async function downloadEmis() {
  await down(EMIS_PROJECT_ID, LANG_FOLDER_PATH_EMIS);
}

async function downloadRegistration() {
  await down(REGISTRATION_PROJECT_ID, LANG_FOLDER_PATH_REGISTRATION);
}

// https://lokalise.com/api2docs/curl/#transition-upload-a-file-post
// If the language does not exist in Lokalise, need to be created first in the project
const uploadToLokalise = ({
  base64File, fileName, langISO, tags, projectId,
}) => new Promise((resolve, reject) => {
  const replaceModified = false;
  const tagUpdatedKeys = replaceModified;
  lokaliseApi.files.upload(projectId, {
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

  await uploadToLokalise({
    base64File: encoded, fileName: 'en.json', langISO: 'en', tags: ['ERRORS'], projectId: EMIS_PROJECT_ID,
  });
}

async function up(projectId, folderPath) {
  // We will upload all files contained in the lang folder
  const files = fs.readdirSync(folderPath);
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const langISO = path.parse(file).name;
    const base64File = fs.readFileSync(`${folderPath}/${file}`, { encoding: 'base64' });
    try {
      // Each loop iteration is delayed until upload operation is completed because Lokalise does not support // requests.
      /* eslint-disable no-await-in-loop */
      await uploadToLokalise({
        base64File, fileName: file, langISO, tags: ['DEV'], projectId,
      });
    } catch (e) {
      throw new Error(e);
    }
  }
}

async function uploadEmis() {
  await up(EMIS_PROJECT_ID, LANG_FOLDER_PATH_EMIS);
}

async function uploadRegistration() {
  await up(REGISTRATION_PROJECT_ID, LANG_FOLDER_PATH_REGISTRATION);
}

for (let i = 0; i < process.argv.length; i += 1) {
  switch (process.argv[i]) {
    case 'down':
      downloadEmis().then(() => downloadRegistration());
      break;
    case 'up':
      uploadEmis().then(() => uploadRegistration());
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
