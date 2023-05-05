/* eslint-disable */

/**
 This file automates the creation and deletion of feature branches by modifying the file in the Terraform project and by creating a pull request (PR) for it.
 IMPORTANT:
 Each developer must add their own Azure Personal Access Token (PAT) and path to the Terraform project on their machine into a config.json in the same folder as this script

 {
  "terraformFolderPath": "",
  "personalAccessToken": ""
}

 More information about PATs can be found here: https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows
 To create a PR, the PAT needs to have the permission Code Read+Write.
 To work, the variables file should contain beneficiary_features and emis_features as an array of strings on one line.
 */

const fs = require('fs');
const minimist = require('minimist');
const simpleGit = require('simple-git');
const axios = require('axios');
const prompt = require('prompt-sync')({sigint: true});
const args = minimist(process.argv.slice(2));

const Mode = {
  preview: '1',
  edit: '2',
}

const Confirm = {
  yes: '1',
  no: '2',
}

const userConfig = getScriptConfig();
const terraformFolderPath = userConfig.terraformFolderPath;
const file = `${terraformFolderPath}/src/environments/dev/variables.tfvars`;

const mode = prompt(`What do you want to do? (preview: ${Mode.preview}, edit:${Mode.edit})`).toString();

if (mode !== Mode.preview && mode !== Mode.edit) {
  console.error('Wrong answer. Closed.')
  process.exit(1);
}

let emisToAdd = [];
let emisToRemove = []
let benefToAdd = []
let benefToRemove = [];
let confirm = null;

if (mode === Mode.edit) {
  console.log('## Current State ##')
  readFile();

  emisToAdd = prompt("Enter values to add for emis (comma separated): ").split(",");
  emisToRemove = prompt("Enter values to remove for emis (comma separated): ").split(",");
  benefToAdd = prompt("Enter values to add for benef (comma separated): ").split(",");
  benefToRemove = prompt("Enter values to remove for benef (comma separated): ").split(",");

  do {
    confirm = prompt(`Do you confirm and want to create the PR? (yes: ${Confirm.yes}, no:${Confirm.no}): `).toString();
  } while (confirm !== Confirm.yes && confirm !== Confirm.no)

  if (confirm.toString() === Confirm.no) {
    console.error('Process closed. Not branch or PR has been created')
    process.exit(1);
  }
}

const actionString = `${mode}-${Math.random()}`;

const branchName = generateFeatureBranchName(emisToAdd, emisToRemove, benefToAdd, benefToRemove)

function generatePRDescription(emisToAdd, emisToRemove, benefToAdd, benefToRemove) {
  const emisText = (emisToAdd || emisToRemove) ? `EMIS: ${emisToAdd ? 'add ' + emisToAdd : ''}${emisToAdd && emisToRemove ? ' ' : ''}${emisToRemove ? 'remove ' + emisToRemove : ''}` : '';
  const benefText = (benefToAdd || benefToRemove) ? `BENEF: ${benefToAdd ? 'add ' + benefToAdd : ''}${benefToAdd && benefToRemove ? ' ' : ''}${benefToRemove ? 'remove ' + benefToRemove : ''}` : '';
  return `${emisText}${emisText && benefText ? '\n' : ''}${benefText}`;
}

function generateFeatureBranchName(emisToAdd, emisToRemove, benefToAdd, benefToRemove) {
  let branchName = 'auto';

  if (emisToAdd[0] !== '') {
    branchName += `/${emisToAdd}`;
  }

  if (emisToRemove[0] !== '') {
    branchName += `/-${emisToRemove}`;
  }

  if (benefToAdd[0] !== '') {
    branchName += `/${benefToAdd}`;
  }

  if (benefToRemove[0] !== '') {
    branchName += `/-${benefToRemove}`;
  }

  return branchName.toLowerCase();
}





const pullRequestConfig = {
  organization: 'CRC-Tech',
  project: 'EMIS',
  repositoryId: 'e8522925-9819-4359-b0e9-90e9193a1c69', // terraform
  branchName,
  title: `[auto] - ${actionString}`,
  description: generatePRDescription(emisToAdd, emisToRemove, benefToAdd, benefToRemove),
  personalAccessToken: userConfig.personalAccessToken,
};

function getScriptConfig(configPath = 'tools/scripts/config.json') {
  const jsonData = fs.readFileSync(configPath);
  return JSON.parse(jsonData);
}

function extractArray(name, data) {
  const regex = new RegExp(`${name} = \\[(.*)\\]`, 'g');
  const match = regex.exec(data);
  return match[1].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
}

function replaceArray(name, arr, data) {
  const regex = new RegExp(`${name} = \\[(.*)\\]`, 'g');
  const str = arr.map((v) => `"${v}"`).join(', ');
  return data.replace(regex, `${name} = [${str}]`);
}

function addValues(arr, values) {
  values.forEach((value) => {
    if (arr.indexOf(value) === -1) {
      arr.push(value);
    }
  });
  return arr;
}

function deleteValues(arr, values) {
  values.forEach((value) => {
    const index = arr.indexOf(value);
    if (index !== -1) {
      arr.splice(index, 1);
    }
  });
  return arr;
}


function readFile() {
  let data = fs.readFileSync(file, 'utf8');
  // Extract the array values from the file data
  let benefArr = extractArray('beneficiary_features', data);
  let emisArr = extractArray('emis_features', data);
  console.log('beneficiary_features', benefArr)
  console.log('emis_features', emisArr)
}


function updateFile(mode, emis, benef) {
  // Read the file
  let data = fs.readFileSync(file, 'utf8');

  // Extract the array values from the file data
  let benefArr = extractArray('beneficiary_features', data);
  let emisArr = extractArray('emis_features', data);

  // Modify the array based on the mode and input values
  if (mode === 'add') {
    if (emis.length > 0) {
      emisArr = addValues(emisArr, emis);
    }
    if (benef.length > 0) {
      benefArr = addValues(benefArr, benef);
    }
  } else if (mode === 'delete') {
    if (emis.length > 0) {
      emisArr = deleteValues(emisArr, emis);
    }
    if (benef.length > 0) {
      benefArr = deleteValues(benefArr, benef);
    }
  }

  // Replace the array values in the file data
  data = replaceArray('beneficiary_features', benefArr, data);
  data = replaceArray('emis_features', emisArr, data);

  // Write the modified file data back to the file
  fs.writeFileSync(file, data, 'utf8');

  console.log(`File ${file} successfully updated.`);
}

async function createPullRequest(config) {
  const repoUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/git/repositories/${config.repositoryId}/pullrequests?api-version=7.0`;
  // Set up the request data
  const data = {
    sourceRefName: `refs/heads/${config.branchName}`,
    targetRefName: 'refs/heads/master',
    title: config.title,
    description: config.description,
  };

  try {
    // Make the request
    const response = await axios.post(repoUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`:${config.personalAccessToken}`).toString('base64')}`,
      },
    });

    // Handle the response
    if (response.status >= 200 && response.status < 300) {
      const jsonResponse = response.data;
      const pullRequestId = jsonResponse.pullRequestId;
      if (!pullRequestId) {
        console.error(`Error creating pull request, please check if your PAT is still valid. In the meantime you can complete the process by creating the PR manually https://dev.azure.com/${config.organization}/${config.project}/_git/terraform/pullrequest/`);
      } else {
        console.log(`Pull request created: https://dev.azure.com/${config.organization}/${config.project}/_git/terraform/pullrequest/${pullRequestId}`);
      }
    } else {
      console.error(`Error creating pull request: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error creating pull request: ${error.message}`);
  }
}
function main() {
  const git = simpleGit();

  git.cwd(terraformFolderPath); // Replace with the path to your local repository

  // Checkout master branch
  git.checkout('master', (err) => {
    if (err) {
      throw err;
    }

    // Pull latest changes on master
    git.pull((err) => {
      if (err) {
        throw err;
      }

      // Create new branch based on master
      git.checkoutBranch(branchName, 'master', (err) => {
        if (err) {
          throw err;
        }

        if (emisToAdd.length > 0 || benefToAdd.length > 0) {
          updateFile('add', emisToAdd, benefToAdd);
        }
        if (emisToRemove.length > 0 || benefToRemove.length > 0) {
          updateFile('delete', emisToRemove, benefToRemove);
        }

        // Updating


        // Add and commit changes
        git.add('.')
          .commit(`Edit feature branches values`, (err) => {
            if (err) {
              throw err;
            }

            // Push changes and create pull request
            git.push('origin', branchName, (err) => {
              if (err) {
                throw err;
              }

              createPullRequest(pullRequestConfig);
            });
          });
      });
    });
  });
}

if (mode === Mode.preview) {
  readFile();
} else {
  main();
}

