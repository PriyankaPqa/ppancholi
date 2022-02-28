const lokalise = require('../../../tools/scripts/lokalise-base');

const up = lokalise.up;
const down = lokalise.down;
const uploadErrors = lokalise.uploadErrors;
const promptDeleteKeys = lokalise.promptDeleteKeys;
const EMIS_PROJECT_ID = lokalise.EMIS_PROJECT_ID;
const REGISTRATION_PROJECT_ID = lokalise.REGISTRATION_PROJECT_ID;

const LANG_FOLDER_PATH_EMIS = 'src/ui/lang/emis';
const LANG_FOLDER_PATH_REGISTRATION = 'src/ui/lang/registration';

const parameters = process.argv.slice(2);

switch (parameters[0]) {
  case 'down':
    down(EMIS_PROJECT_ID, LANG_FOLDER_PATH_EMIS)
      .then(() => down(REGISTRATION_PROJECT_ID, LANG_FOLDER_PATH_REGISTRATION)
        .then(() => process.exit(0)));
    break;
  case 'up':
    up(EMIS_PROJECT_ID, LANG_FOLDER_PATH_EMIS)
      .then(() => up(REGISTRATION_PROJECT_ID, LANG_FOLDER_PATH_REGISTRATION)
        .then(() => process.exit(0)));
    break;
  case 'upErrors':
    uploadErrors().then(() => process.exit(0));
    break;
  case 'delete':
    promptDeleteKeys(parameters, 'emis-app');
    break;
  default:
    break;
}

module.exports.down = down;
module.exports.up = up;
module.exports.uploadErrors = uploadErrors;
