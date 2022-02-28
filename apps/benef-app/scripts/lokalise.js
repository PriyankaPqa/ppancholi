const path = require('path');
const lokalise = require('../../../tools/scripts/lokalise-base');

const LANG_FOLDER_PATH = path.resolve(__dirname, '../src/ui/lang');
const REGISTRATION_PROJECT_ID = lokalise.REGISTRATION_PROJECT_ID;

const up = lokalise.up;
const down = lokalise.down;
const promptDeleteKeys = lokalise.promptDeleteKeys;

const parameters = process.argv.slice(2);

switch (parameters[0]) {
  case 'down':
    down(REGISTRATION_PROJECT_ID, LANG_FOLDER_PATH).then(() => process.exit(0));
    break;
  case 'up':
    up(REGISTRATION_PROJECT_ID, LANG_FOLDER_PATH).then(() => process.exit(0));
    break;
  case 'delete':
    promptDeleteKeys(parameters, 'benef-app');
    break;
  default:
    break;
}

module.exports.down = down;
module.exports.up = up;
