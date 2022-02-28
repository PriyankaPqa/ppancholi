const jetpack = require('fs-jetpack');
const { execSync } = require('child_process');
const fs = require('fs');

const mergedDir = './coverage';

// Create /coverage folder if not existing
if (!fs.existsSync(mergedDir)) {
  fs.mkdirSync(mergedDir);
}

function mergeCodeCoverage() {
  // Find all cobertura-coverage.xml in the project
  const filesPath = jetpack.find('', { matching: ['cobertura-coverage.xml', '!node_modules/**/*'] });

  // Build string package1=path_to_xml package2=path_to_xml
  const packages = filesPath
    .map((filePath) => {
      const projectName = filePath.split('/')[1];
      return `${projectName}=${filePath}`;
    })
    .join(' ');

  // Build the script command
  const script = `npx cobertura-merge -o ${mergedDir}/merged-cobertura-coverage.xml ${packages}`;

  execSync(script);
}

mergeCodeCoverage();
