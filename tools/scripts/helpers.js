const { execSync, spawn } = require('child_process');

/**
 * Executes shell commands synchronously
 * @param cmd
 * @returns {string}
 */
const shellSync = (cmd) => execSync(cmd, { encoding: 'utf8' });

const shellAsync = (cmd) => new Promise((resolve, reject) => {
  const script = spawn(cmd, { shell: true });

  script.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  script.stderr.on('data', (data) => {
    console.error(`${data}`);
  });

  script.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      resolve(code);
    } else if (code === 1) {
      reject(code);
    }
  });
});
/**
 * Return a list of affected packages
 * @param isPullRequest
 * @returns Array<string>
 */
const getAffectedPackages = (isPullRequest) => {
  const since = isPullRequest === true ? 'origin/master' : 'origin/master~1';
  const output = shellSync(`npx lerna list --json --all --since ${since} --include-dependents`);
  const packages = JSON.parse(output);
  return packages.map((p) => p.name);
};

module.exports.getAffectedPackages = getAffectedPackages;
module.exports.shellSync = shellSync;
module.exports.shellAsync = shellAsync;
