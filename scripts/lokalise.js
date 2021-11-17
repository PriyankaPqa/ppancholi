/* eslint-disable */
//  https://github.com/lokalise/node-lokalise-api#installation
const unzipper = require('unzipper');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { LokaliseApi } = require('@lokalise/node-api');

const API_KEY_READ_WRITE = '012f35ddfa553d3fe3839189b37cb6bc320ea268';
const PROJECT_ID = '495058395f5240e2843ef1.45815308';
const LANG_FOLDER_PATH = 'src/ui/lang';

const lokaliseApi = new LokaliseApi({ apiKey: API_KEY_READ_WRITE });

function down() {
  lokaliseApi.files.download(PROJECT_ID, {
    format: 'json',
    bundle_structure: '%LANG_ISO%.json',
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
const uploadToLokalise = (base64File, fileName, langISO) => new Promise((resolve, reject) => {
  const replaceModified = false;
  const tagUpdatedKeys = replaceModified;
  lokaliseApi.files.upload(PROJECT_ID, {
    data: base64File,
    filename: fileName, // fr.json, en.json, ....
    lang_iso: langISO, // fr, en, it, jp, ...
    replace_modified: replaceModified, // Enable to replace translations, that have been modified (in the file being uploaded).
    tag_updated_keys: tagUpdatedKeys,
    tag_skipped_keys: false,
    convert_placeholder: true, // Placeholder will be converted to a universal used by Lokalise
    tags: ['DEV'],
    apply_tm: false,
  }).then((response) => {
    resolve(response);
  }).catch((error) => {
    reject(error);
  });
});

function deleteTranslations(keysToBeDeletedPath, folder) {
  ['en.json', 'fr.json', 'test.json'].forEach((fileName) => {
    const filePath = `${folder}/${fileName}`;

    if (!fs.existsSync(filePath)) {
      console.warn(`Path "${filePath}" not found !`);
      return;
    }

    const origin = fs.readFileSync(filePath).toString().split('\n');
    const listToDelete = fs.readFileSync(keysToBeDeletedPath).toString().split('\n');

    const result = [];

    for (line of origin) {
      let keyToDelete = null;
      for (key of listToDelete) {
        if (line.trim().includes(`"${key.trim()}":`)) {
          keyToDelete = key;
        }
      }
      if (keyToDelete) {
        console.log(`Found: ${keyToDelete.trim()} in ${filePath}`);
      } else {
        result.push(line);
      }
    }

    const lastItemIndex = result.length - 2;
    const lastItem = result[lastItemIndex];
    if (lastItem[lastItem.length - 1] === ',') {
      result[lastItemIndex] = lastItem.slice(0, -1); // remove the last comma
    }

    fs.writeFileSync(filePath, result.join('\n'), 'utf8');
  });
}

function deleteLocalKeys(keysToBeDeletedPath, languageFolderPath) {
  const files = fs.readdirSync(languageFolderPath);
  if (files.includes('en.json')) {
    deleteTranslations(keysToBeDeletedPath, languageFolderPath);
  } else {
    files.forEach((f) => {
      const path = `${languageFolderPath}/${f}`;
      if (fs.statSync(path).isDirectory()) {
        deleteLocalKeys(keysToBeDeletedPath, path);
      }
    });
  }
}

async function up() {
  // We will upload all files contained in the lang folder
  const files = fs.readdirSync(LANG_FOLDER_PATH);
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const langISO = path.parse(file).name;
    const base64File = fs.readFileSync(`${LANG_FOLDER_PATH}/${file}`, { encoding: 'base64' });
    try {
      // Each loop iteration is delayed until upload operation is completed because Lokalise does not support // requests.
      /* eslint-disable no-await-in-loop */
      await uploadToLokalise(base64File, file, langISO);
    } catch (e) {
      throw new Error(e);
    }
  }
}

const arguments = process.argv.slice(2);

switch (arguments[0]) {
  case 'down':
    down();
    break;
  case 'up':
    up();
    break;
  case 'delete':
    if (arguments[1] && arguments[1] === '-file' && arguments[3] === '-path') {
      const keysToBeDeletedPath = arguments[2];
      const languageFolderPath = arguments[4];
      deleteLocalKeys(keysToBeDeletedPath, languageFolderPath);
    } else if (arguments[1] !== '-file') {
      console.log('Please specify the file path including keys to be deleted -file file_path');
    } else if (arguments[3] !== '-path') {
      console.log('Please specify the file path of the folder containing locales');
    }
    break;
  default:
    break;
}

module.exports.down = down;
module.exports.up = up;
