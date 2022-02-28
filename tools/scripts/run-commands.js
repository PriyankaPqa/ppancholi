const { execSync } = require('child_process');
const shell = (cmd) => execSync(cmd, {encoding: 'utf8'});

const arguments = process.argv.slice(2);
const paramCommand = arguments[0];
const isPullRequest = arguments[1] === 'True';
const applicationName = arguments[2]

const commands = [];

/**
 * Return a list of affected packages
 * @param isPullRequest
 * @returns Array<string>
 */
const getAffectedPackages = (isPullRequest) => {
  const since = isPullRequest === true ?  'origin/master' : 'origin/master~1';
  const output = shell(`npx lerna list --json --all --since ${since} --include-dependents`);
  const packages = JSON.parse(output)
  return packages.map(p => p.name)
}

if (paramCommand === undefined || isPullRequest === undefined || applicationName === undefined) {
  console.log(new Error('1st param should be the command to execute. 2nd should be isPullRequest. 3rd should be applicationName'))
}

const packages = getAffectedPackages(isPullRequest);

if (packages.includes('@libs/registration-lib')) {
  commands.push(`yarn registration-lib:${paramCommand}`)
}

// Only execute command on benef-app if in its pipeline
if (packages.includes('@apps/benef-app') && applicationName === 'benef-app') {
  commands.push(`yarn benef-app:${paramCommand}`)
}

// Only execute command on emis-app if in its pipeline
if (packages.includes('@apps/emis-app') && applicationName === 'emis-app') {
  commands.push(`yarn emis-app:${paramCommand}`)
}

console.log(`Executing the generated command: ${commands.join(' && ')}`)

shell(commands.join(' && '))









