// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
module.exports = [
  {
    type: 'input',
    name: 'name',
    message: "What's the name of the module? (example: myModule)",
  },
  {
    type: 'input',
    name: 'interfaceName',
    message: "What's the name of the interface of the module? (example: IModuleState)",
  },
  {
    type: 'confirm',
    name: 'actions',
    message: 'Do you want to add actions?',
  },
  {
    type: 'confirm',
    name: 'getters',
    message: 'Do you want to add getters?',
  },
];
