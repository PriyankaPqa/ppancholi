// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
module.exports = [
  {
    type: 'input',
    name: 'folderName',
    message: "What's the name of the service folder? (use dashed if several words)",
  },
  {
    type: 'input',
    name: 'name',
    message: "What's the prefix for each file? (use camelCase if you typed dashed-folder)",
  },
];
