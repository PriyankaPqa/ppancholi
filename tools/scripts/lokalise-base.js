/* eslint-disable */

const unzipper = require('unzipper');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { LokaliseApi } = require('@lokalise/node-api');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const API_KEY_READ_WRITE = '012f35ddfa553d3fe3839189b37cb6bc320ea268';
const EMIS_PROJECT_ID = '955065625d9745a35c6f72.71379721';
const REGISTRATION_PROJECT_ID = '495058395f5240e2843ef1.45815308';

const SLICE_SIZE = 100;

const lokaliseApi = new LokaliseApi({ apiKey: API_KEY_READ_WRITE });

// Documentation https://lokalise.github.io/node-lokalise-api/

/**
 * Upload a file to Lokalise server
 * @param base64File
 * @param fileName
 * @param langISO
 * @param tags
 * @param projectId
 * @returns {Promise<unknown>}
 */
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
    console.error(error);
    reject(error);
  });
});

/**
 * Upload all languages files to lokalise
 * @param projectId
 * @param folderPath
 * @returns {Promise<void>}
 */
const up = (projectId, folderPath) => new Promise((resolve, reject) => {
  console.log(`Upload ${folderPath} to project ${projectId}`);
  // We will upload all files contained in the lang folder
  const files = fs.readdirSync(folderPath);
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const langISO = path.parse(file).name;
    const base64File = fs.readFileSync(`${folderPath}/${file}`, { encoding: 'base64' });
    try {
      // Each loop iteration is delayed until upload operation is completed because Lokalise does not support // requests.
      /* eslint-disable no-await-in-loop */
      uploadToLokalise({
        base64File, fileName: file, langISO, tags: ['DEV'], projectId,
      }).then((response) => resolve(response)).catch((error) => reject(error));
    } catch (e) {
      reject(e);
    }
  }
});

/**
 * Delete keys from the server
 * @param projectId
 * @param idsToBeDeleted
 * @returns {Promise<unknown>}
 */
const deleteFromLokalise = async (projectId, idsToBeDeleted) => new Promise((resolve, reject) => {
  lokaliseApi.keys.bulk_delete(idsToBeDeleted, { project_id: projectId })
    .then((response) => resolve(response))
    .catch((error) => reject(error));
});

/**
 * Fetch ids of keys by name
 * @param projectId
 * @param keys
 * @returns {Promise<[]|string[]>}
 */
const fetchKeysIds = async (projectId, keys) => {
  try {
    const response = await lokaliseApi.keys.list({
      project_id: projectId,
      filter_keys: keys.join(','),
    });
    return response.map((key) => key.key_id);
  } catch (e) {
    console.log(e);
    return [];
  }
};

/**
 * Fetch all errors from API error from the back-end
 * @returns {Promise<unknown>}
 */
const getAllErrors = () => new Promise((resolve, reject) => {
  let errors = {};

  https.get('https://api-dev.crc-tech.ca/common/api-error-templates', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      try {
        errors = JSON.parse(data);
        resolve(errors);
      } catch (e) {
        reject(e);
      }
    });
  }).on('error', (err) => {
    reject(err.message);
  });
});

/**
 * Upload errors from BE to Lokalise
 * @returns {Promise<void>}
 */
const uploadErrors = (projectId) => new Promise((resolve, reject) => {
  const finalObject = {};

  getAllErrors().then((errors) => {
    console.log(errors);
    if (errors) {
      for (const [key, error] of Object.entries(errors)) {
        finalObject[error.code] = error.detail || error.message;
      }
      const encoded = Buffer.from(JSON.stringify(finalObject)).toString('base64');
      uploadToLokalise({
        base64File: encoded, fileName: 'en.json', langISO: 'en', tags: ['ERRORS'], projectId,
      }).then((response) => resolve(response));
    } else {
      console.log('No new errors to fetch');
      resolve(true);
    }
  }).catch((error) => reject(error));
});

/**
 * Download all locales from a specific project in Lokalise
 * @param projectId
 * @param path
 */
const down = (projectId, path) => new Promise((resolve) => {
  console.log(`Download keys from project ${projectId} to ${path}`);
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
    resolve(true);
  });
});

async function deleteKeys(filePath, projectID, sliceSize = SLICE_SIZE) {
  const keysToBeDeleted = fs.readFileSync(filePath, 'utf-8').split('\n');
  // We slice the file otherwise the URL is too long
  for (let i = 0; i < keysToBeDeleted.length; i += sliceSize) {
    const slice = keysToBeDeleted.slice(i, i + sliceSize);
    const idsToBeDeleted = await fetchKeysIds(projectID, slice);
    console.log('idsToBeDeleted', idsToBeDeleted);
    if (idsToBeDeleted.length === 0) {
      return;
    }
    await deleteFromLokalise(projectID, idsToBeDeleted);
  }
}

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

// Example: yarn lokalise:delete -file C:/CRC/EMIS/emis-webapp/scripts/i18n_keys_to_delete.txt -path C:/CRC/EMIS/emis-webapp/src/ui/lang
async function deleteLocalAndLokaliseKeys(parameters, applicationName) {
  if (parameters[1] && parameters[1] === '-file' && parameters[3] === '-path') {
    const keysToBeDeletedPath = parameters[2];
    const languageFolderPath = parameters[4];

    deleteLocalKeys(keysToBeDeletedPath, languageFolderPath);

    if (applicationName === 'emis-app') {
      await deleteKeys(keysToBeDeletedPath, EMIS_PROJECT_ID);
      await deleteKeys(keysToBeDeletedPath, REGISTRATION_PROJECT_ID);
    } else if (applicationName === 'benef-app') {
      await deleteKeys(keysToBeDeletedPath, REGISTRATION_PROJECT_ID);
    }
  } else if (parameters[1] !== '-file') {
    console.log('Please specify the file path including keys to be deleted -file -path');
  } else if (parameters[3] !== '-path') {
    console.log('Please specify the file path of the folder containing locales');
  }
}

function promptDeleteKeys(parameters, applicationName) {
  rl.question('Are you sure? This will remove keys both locally and on Lokalise server. Type "yes" to confirm: ', (consent) => {
    if (consent === 'yes') {
      deleteLocalAndLokaliseKeys(parameters, applicationName);
    }
    rl.close();
  });
}

module.exports.down = down;
module.exports.up = up;
module.exports.uploadErrors = uploadErrors;
module.exports.promptDeleteKeys = promptDeleteKeys;

module.exports.EMIS_PROJECT_ID = EMIS_PROJECT_ID;
module.exports.REGISTRATION_PROJECT_ID = REGISTRATION_PROJECT_ID;
