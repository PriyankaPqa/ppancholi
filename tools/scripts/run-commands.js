const { shellAsync, getAffectedPackages } = require('./helpers');

/**
 * This script is to generate commands for affected packages
 */

const parameters = process.argv.slice(2);
const paramCommand = parameters[0];
const isPullRequest = parameters[1] === 'True';
const applicationName = parameters[2];

const commands = [];

if (paramCommand === undefined || isPullRequest === undefined || applicationName === undefined) {
  console.log(parameters);
  console.log(new Error('1st param should be the command to execute. 2nd should be isPullRequest. 3rd should be applicationName'));
  process.exit(1);
}

const packages = getAffectedPackages(isPullRequest);

if (packages.includes('@libs/registration-lib')) {
  commands.push(`yarn registration-lib:${paramCommand}`);
}

// Only execute command on benef-app if in its pipeline
if (packages.includes('@apps/benef-app') && applicationName === 'benef-app') {
  commands.push(`yarn benef-app:${paramCommand}`);
}

// Only execute command on emis-app if in its pipeline
if (packages.includes('@apps/emis-app') && applicationName === 'emis-app') {
  commands.push(`yarn emis-app:${paramCommand}`);
}

console.log(`Executing the generated command: ${commands.join(' && ')}`);

shellAsync(commands.join(' && '));
