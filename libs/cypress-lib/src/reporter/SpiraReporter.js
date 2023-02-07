/* eslint-disable */

const mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const SpiraClient = require('./SpiraClient.js');

module.exports = SpiraReporter;



function SpiraReporter(runner, options) {
  mocha.reporters.Base.call(this, runner);

  const self = this;
  const color = mocha.reporters.Base.color;

  let passes = 0;
  let failures = 0;
  const startDate = new Date();
  let stackTrace = '';
  let testName = '-';
  let topName = '';
  let specFile = null;
  const steps = [];
  this._options = {};
  let allTitles = [];

  function extractTitles (obj) {
    if (obj.hasOwnProperty('parent')) {
      allTitles.push(obj.title);
      let nextObj = obj.parent;
      extractTitles(nextObj);
    }
  }

  function getHighestParentTitle() {
    return allTitles[allTitles.length - 1]
  }

  function extractTestCaseNumberFromTitle(title) {
    const findPattern = title.match('#TC(.*)#');
   return findPattern !== null ? findPattern[1].trim() : null;
  }



  // Get the Reporter options from configuration
  options = options || {};
  const reporterOptions = options.reporterOptions || {};
  // console.log(reporterOptions);
  if (reporterOptions) {
    this._options = reporterOptions;
  }



  const restDone = false;

  runner.on('start', () => {
    // Log to the console that we're running using this reporter
    console.log(color('suite', 'Starting Test Run using SpiraTest Reporter'));
  });

  runner.on('pass', (test) => {
    extractTitles(test);
    passes++;

    // Log to the console
    // console.log(`${color('checkmark', mocha.reporters.Base.symbols.ok)} ${color('pass', 'pass: %s')}`, test.fullTitle());

    // Add to the stack trace and steps
    stackTrace += `${mocha.reporters.Base.symbols.ok} pass: ${test.fullTitle()}\n`;
    steps.push({ ActualResult: 'Pass', ExecutionStatusId: 2 /* Pass */, Description: test.title });
    testName = test.parent.title;
    specFile = test.invocationDetails.relativeFile;
  });

  runner.on('fail', (test, err) => {
    failures++;
    // Output to the console - Spec format
    console.log(color('fail', `${mocha.reporters.Base.symbols.err} fail: %s -- error: %s`), test.fullTitle(), err.message);

    // Add to the stack trace
    stackTrace += `${mocha.reporters.Base.symbols.err} fail: ${test.fullTitle()}\n`;
    steps.push({ ActualResult: err.message, ExecutionStatusId: 1 /* Fail */, Description: test.title });
    testName = test.parent.title;
    if (test.parent.parent && test.parent.parent.file && !specFile) {
      specFile = test.parent.parent.file;
    }
  });

  runner.on('end', (runnable) => {
    // Find the matching test case id from the mapping
    let testCaseId = null;
    if (self._options.autoMapping && allTitles.length > 0) { // Custom property autoMapping to resolve the test case from the title
      testCaseId = extractTestCaseNumberFromTitle(getHighestParentTitle())
    }
    else if (self._options.mapping && self._options.mapping[testName]) {
      testCaseId = parseInt(self._options.mapping[testName]);
    }

    if (testCaseId) {
      // console.log(color('suite', 'Test Run ended with: %d passed, %d failed out of %d test(s).'), passes, failures, passes + failures);
      console.log(color('suite', `Sending results to SpiraTest for test case TC:${testCaseId}`));

      // Send to SpiraTest
      const spiraClient = new SpiraClient(self._options.protocol, self._options.host, self._options.port, self._options.vdir, self._options.login, self._options.apiKey);
      const projectId = self._options.projectId;
      const releaseId = self._options.releaseId;
      const testSetId = self._options.testSetId;
      const endDate = new Date();
      let executionStatusId = 4; /* N/A */
      const assertCount = failures;
      const totalCount = passes + failures;
      const message = `${passes} passed, ${failures} failed out of ${totalCount} test(s).`;
      if (totalCount > 0) {
        executionStatusId = (failures > 0) ? /* Failed */ 1 : /* Passed */ 2;
      }

      const context = {
        self,
        specFile,
      };

      spiraClient.recordTestRun(projectId, testCaseId, releaseId, testSetId, startDate, endDate, executionStatusId, testName, assertCount, message, stackTrace, steps, self._onRecordSuccess, self._onRecordFailure, context);
    } else {
      console.log(color('fail', 'No SpiraTest test case ID found for this test, so it won\'t be reported back to SpiraTest'));
      console.log(color('fail', 'If autoMapping is true, please include #TC in the title. Otherwise, add a mapping in cypress config'));
    }
  });
}

SpiraReporter.prototype._onRecordSuccess = function (testRunId, context) {
  const self = context.self;
  const specFilePath = context.specFile;
  // var specFilePath = cypress\e2e\1-getting-started\todo2.cy.js;

  // Now we can try and upload any screenshots to SpiraTest
  const specFileName = path.basename(specFilePath);
  // var directoryPath ='cypress/screenshots/todo2.cy.js';
  const directoryPath = path.join('cypress', 'screenshots', specFileName);

  // Make sure the folder exists
  if (fs.existsSync(directoryPath)) {
    // Get all the files
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.log(`Unable to enumerate directory: ${directoryPath}, error: ${err}`);
        return;
      }

      // Iterate over all the files
      files.forEach((filename) => {
        // open the file
        const pathName = path.join(directoryPath, filename);
        fs.readFile(pathName, { encoding: 'base64' }, (err, data) => {
          if (err) {
            console.log(`Unable to open file: ${pathName}, error: ${err}`);
            return;
          }
          // Upload the file to spira
          const spiraClient = new SpiraClient(self._options.protocol, self._options.host, self._options.port, self._options.vdir, self._options.login, self._options.apiKey);
          const projectId = self._options.projectId;
          const binaryData = data; // 'VGVzdDEyMw==';
          const artifactTypeId = 5;
          const artifactId = testRunId;
          spiraClient.documentUpload(projectId, filename, binaryData, artifactTypeId, artifactId, self._onUploadSuccess, self._onUploadFailure);
        });
      });
    });
  } else {
    console.log(`Unable to find screenshot directory at location: ${directoryPath}`);
  }
};
SpiraReporter.prototype._onRecordFailure = function () {
};
SpiraReporter.prototype._onUploadSuccess = function () {
};
SpiraReporter.prototype._onUploadFailure = function () {
};
