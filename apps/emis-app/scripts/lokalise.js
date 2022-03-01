const path = require('path');
const {
  up, down, promptDeleteKeys, uploadErrors, EMIS_PROJECT_ID, REGISTRATION_PROJECT_ID,
} = require('../../../tools/scripts/lokalise-base');

const LANG_FOLDER_PATH_EMIS = path.resolve(__dirname, '../src/ui/lang/emis');
const LANG_FOLDER_PATH_REGISTRATION = path.resolve(__dirname, '../src/ui/lang/registration');

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
