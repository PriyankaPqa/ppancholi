/* eslint-disable */

/**
 This file automates the creation and deletion of feature branches by modifying the file in the Terraform project and by creating a pull request (PR) for it.
 IMPORTANT:
 Each developer must add their own Azure Personal Access Token (PAT) and path to the Terraform project on their machine into a .env.local

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
require('dotenv').config({ path: __dirname + `/../../.env.local` , override: true })

const Mode = {
  preview: '1',
  edit: '2',
  clean: '3'
}

const Confirm = {
  yes: '1',
  no: '2',
}

const azureAPIConfig = {
  organization: 'CRC-Tech',
  project: 'EMIS',
  repositoryId: 'e8522925-9819-4359-b0e9-90e9193a1c69', // terraform
  personalAccessToken: process.env.AZURE_PAT,
}
const terraformFolderPath = process.env.TERRAFORM_PATH;
const file = `${terraformFolderPath}/src/environments/dev/variables.tfvars`;

const jiraAPIConfig = {
  baseUrl: 'https://rctech.atlassian.net',
  apiToken: process.env.JIRA_TOKEN,
  email: process.env.JIRA_EMAIL,
  project: 'EMISV2'
}

let emisToAdd = [];
let emisToRemove = []
let benefToAdd = []
let benefToRemove = [];
let confirm = null;

const jiraStatusCleanTarget = ['resolved', 'done', 'duplicate', 'cannot reproduce', 'work as expected', "won't do"];

function generatePRDescription(emisToAdd, emisToRemove, benefToAdd, benefToRemove) {
  const emisText = (emisToAdd.length > 0 || emisToRemove.length > 0) ? `EMIS: ${emisToAdd.length > 0 ? 'add ' + emisToAdd : ''} ${emisToRemove.length > 0 ? 'remove ' + emisToRemove : ''}` : '';
  const benefText = (benefToAdd.length > 0 || benefToRemove.length > 0) ? `BENEF: ${benefToAdd.length > 0 ? 'add ' + benefToAdd : ''} ${benefToRemove.length > 0 ? 'remove ' + benefToRemove : ''}` : '';
  return `${emisText}${emisText && benefText ? '\n' : ''}${benefText}`;
}
function generateFeatureBranchName(emisToAdd, emisToRemove, benefToAdd, benefToRemove) {
  let branchName = 'auto';

  if (emisToAdd.length > 0) {
    branchName += `/${emisToAdd}`;
  }

  if (emisToRemove.length > 0) {
    branchName += `/${emisToRemove}`;
  }

  if (benefToAdd.length > 0) {
    branchName += `/${benefToAdd}`;
  }

  if (benefToRemove. length > 0) {
    branchName += `/${benefToRemove}`;
  }

  return branchName.toLowerCase();
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
  return [benefArr, emisArr]
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

async function verifyAzureToken() {
  const url = `${getRepoUrl(azureAPIConfig)}`

  return new Promise((resolve, reject) => {
    axios.get(url, { headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`:${azureAPIConfig.personalAccessToken}`).toString('base64')}`,
      }, })
      .then((response) => {
        if (response.status === 200) {
          console.log("Azure Devops authenticated successfully");
          resolve(true);
        } else {
          console.error(`Azure Devops authentication failed with status code: ${response.status}`);
          console.error('You may need to renew your Personal Access Token');
          resolve(false);
        }
      })
      .catch((error) => {
        console.error("Azure Devops authentication failed:", error.message);
        console.error('You may need to renew your Personal Access Token');
        resolve(false);
      });
});
}
function getRepoUrl(azureConfig) {
  return `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/git/repositories/${azureConfig.repositoryId}`;
}
async function createPullRequest(azureConfig, branchName, title, description) {
  const url = `${getRepoUrl(azureConfig)}/pullrequests?api-version=7.0`
  // Set up the request data
  const data = {
    sourceRefName: `refs/heads/${branchName}`,
    targetRefName: 'refs/heads/master',
    title,
    description,
  };

  try {
    // Make the request
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`:${azureConfig.personalAccessToken}`).toString('base64')}`,
      },
    });

    // Handle the response
    if (response.status >= 200 && response.status < 300) {
      const jsonResponse = response.data;
      const pullRequestId = jsonResponse.pullRequestId;
      if (!pullRequestId) {
        console.error(`Error creating pull request, please check if your PAT is still valid. In the meantime you can complete the process by creating the PR manually https://dev.azure.com/${config.organization}/${config.project}/_git/terraform/pullrequest/`);
      } else {
        console.log(`Pull request created: https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_git/terraform/pullrequest/${pullRequestId}`);
        return jsonResponse;
      }
    } else {
      console.error(`Error creating pull request: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error creating pull request: ${error.message}`);
  }
}
async function preview() {
  return new Promise((resolve, reject) => {
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
        console.log('## Current State (master) ##')
        const [benefArr, emisArr] = readFile();
        resolve([benefArr, emisArr]);
      });
    });
  });
}
async function updatePullRequest(azureConfig, pullRequestID, data) {
  const url = `${getRepoUrl(azureConfig)}/pullrequests/${pullRequestID}?api-version=7.0`
  try {
    const response = await axios.patch(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`:${azureConfig.personalAccessToken}`).toString('base64')}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      console.log(`Pull request updated`);
    } else {
      console.error(`Error updating pull request: ${response.status} ${response.statusText}`);
    }
  }
  catch (error) {
    console.error(`Error updating pull request: ${error.message}`);
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

      const branchName = generateFeatureBranchName(emisToAdd, emisToRemove, benefToAdd, benefToRemove)

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
              const description = generatePRDescription(emisToAdd, emisToRemove, benefToAdd, benefToRemove);
              createPullRequest(azureAPIConfig, branchName, `[auto-fb] - Edit feature branches`,  description).then((jsonResponse) => {
                const pullRequestId = jsonResponse.pullRequestId;
                const createById = jsonResponse.createdBy.id;
                  updatePullRequest(azureAPIConfig, pullRequestId, {
                    autoCompleteSetBy: {id: createById},
                    completionOptions: {
                      mergeCommitMessage: 'auto pr feature branch',
                      mergeStrategy: 'squash',
                      deleteSourceBranch: true,
                    }
                  })
                })
            });
          });
      });
    });
  });
}

function confirmAndProceed() {
  do {
    confirm = prompt(`Do you confirm and want to create the PR? (yes: ${Confirm.yes}, no:${Confirm.no}): `)
      .toString();
  } while (confirm !== Confirm.yes && confirm !== Confirm.no)

  if (confirm.toString() === Confirm.no) {
    console.error('Process closed. Not branch or PR has been created')
    process.exit(1);
  }
  main();
}

async function getJiraItemById(id) {
  const url = `${jiraAPIConfig.baseUrl}/rest/api/3/issue/${jiraAPIConfig.project}-${id}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`:${jiraAPIConfig.email}:${jiraAPIConfig.apiToken}`).toString('base64')}`, // Use Bearer Token
      },
    });
    return response.data;
  } catch (e) {
    return null;
  }
}

async function verifyJiraAuth () {
  return new Promise((resolve, reject) => {
    axios.get(`${jiraAPIConfig.baseUrl}/rest/api/latest/myself`, { headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`:${jiraAPIConfig.email}:${jiraAPIConfig.apiToken}`).toString('base64')}`, // Use Bearer Token
      }, })
      .then((response) => {
        if (response.status === 200) {
          console.log("JIRA authenticated successfully");
          resolve(true);
        } else {
          console.error(`JIRA authentication failed with status code: ${response.status}`);
          console.error(response.data);
          resolve(false);
        }
      })
      .catch((error) => {
        console.error("Jira authentication error:", error.message);
        resolve(false);
      });
  });

}

async function hasJiraItemStatus(id, statuses) {
  const item = await getJiraItemById(id);
  if (item) {
    return statuses.includes(item.fields.status.name.toLowerCase());
  }
  return false;
}

async function filterJiraItemsByStatuses(ids, statuses) {
  const resolvedPromises = ids.map(async (id) => {
    const hasStatus = await hasJiraItemStatus(id, statuses)
    return hasStatus === true ? id : null;
  })
  const results = await Promise.all(resolvedPromises)
  return results.filter(r => r !== null)
}


const mode = prompt(`Pick you mode (preview: ${Mode.preview}, edit:${Mode.edit}, clean:${Mode.clean}). Note that edit will auto-clean ${jiraStatusCleanTarget} items: `).toString();

if (mode === Mode.preview) {
    preview();
} else if (mode === Mode.edit) {
  verifyAzureToken().then((azureOK) => {
    if (!azureOK) {
      process.exit(1);
    }
    verifyJiraAuth().then((jiraOk) => {
      if (!jiraOk) {
        process.exit(1);
      }
      preview()
        .then(([benefArr, emisArr]) => {
        emisToAdd = prompt("Enter values to add for emis (comma separated): ")
          .split(",")
          .filter(v => v !== '');
  
          filterJiraItemsByStatuses(emisArr, jiraStatusCleanTarget).then((items) => {
          console.log(`The following feature branches are ${jiraStatusCleanTarget} and will be deleted (emis-app)`);
          emisToRemove = items;
          console.log(items)
        });
  
        benefToAdd = prompt("Enter values to add for benef (comma separated): ")
          .split(",")
          .filter(v => v !== '');
  
          filterJiraItemsByStatuses(benefArr, jiraStatusCleanTarget).then((items) => {
            console.log(`The following feature branches are ${jiraStatusCleanTarget} and will be deleted (benef-app)`);
            benefToRemove = items;
            console.log(items)
          });
  
        confirmAndProceed();
  
      })
    })
  });
 
}
else if (mode === Mode.clean) {
  verifyJiraAuth().then((jiraOk) => {
    if (!jiraOk) {
      process.exit(1);
    }
    console.log('Starting cleaning process');
    preview()
      .then(([benefArr, emisArr]) => {
        filterJiraItemsByStatuses(benefArr, jiraStatusCleanTarget).then((items) => {
          console.log(`The following feature branches are ${jiraStatusCleanTarget} and will be deleted (benef-app)`);
          benefToRemove = items;
          console.log(items)
          filterJiraItemsByStatuses(emisArr, jiraStatusCleanTarget).then((items) => {
            console.log(`The following feature branches are ${jiraStatusCleanTarget} and will be deleted (emis-app)`);
            emisToRemove = items;
            console.log(items);
            confirmAndProceed();
          })
        })
      });
  })
}

 else {
  console.error('Wrong answer. Closed.')
  process.exit(1);
}

