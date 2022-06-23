const jetpack = require('fs-jetpack');
const { execSync } = require('child_process');
const fs = require('fs');

const mergedDir = './coverage';

const parameters = process.argv.slice(2);
const lookInFolder = parameters[0];

// Create /coverage folder if not existing
if (!fs.existsSync(mergedDir)) {
  fs.mkdirSync(mergedDir);
}

function mergeCodeCoverage() {
  // Find all cobertura-coverage.xml in the project
  const filesPath = jetpack.find(`${lookInFolder}`, { matching: ['cobertura-coverage.xml', '!node_modules/**/*'] });

  console.log(`Found coverage reports in ${filesPath}`);

  // Build string package1=path_to_xml package2=path_to_xml
  const packages = filesPath
    .map((filePath) => {
      const filePathSplit = filePath.split('/');
      let projectName = '';

      if (filePathSplit.length === 3) { // 'benef-app/coverage/cobertura-coverage.xml'
        projectName = filePath.split('/')[1];
      } else { // 'coverage-job-0/cobertura-coverage.xml'
        projectName = filePath.split('/')[0];
      }

      return `${projectName}=${filePath}`;
    })
    .join(' ');

  // Build the script command
  const script = `yarn cobertura-merge -o ${mergedDir}/merged-cobertura-coverage.xml ${packages}`;
  console.log(`Will run: ${script}`);
  execSync(script);
}

mergeCodeCoverage();
