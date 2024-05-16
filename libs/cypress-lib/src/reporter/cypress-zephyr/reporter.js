Object.defineProperty(exports, '__esModule', { value: true });
exports.Reporter = void 0;
const mocha_1 = require('mocha');
const child_process_1 = require('child_process');
const colors_1 = require('colors');

const { EVENT_RUN_END, EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_TEST_PENDING } = mocha_1.Runner.constants;
class Reporter {
  projectKey;

  testResults = [];

  testCaseKeyRegex = /\[(.*?)\]/;

  mochaRunner;

  mergeSameTestExecutions;

  constructor(mochaRunner, options) {
    this.mochaRunner = mochaRunner;
    this.projectKey = options.projectKey;
    this.mergeSameTestExecutions = options.mergeSameTestExecutions;
  }

  convertStatus(status) {
    if (status === 'failed') {
      return 'Fail';
    }
    if (status === 'passed') {
      return 'Pass';
    }
    if (status === 'timedOut') {
      return 'Blocked';
    }
    return 'Not Executed';
  }

  getMergeStatus(testResults) {
    if (testResults.some((item) => item.result === 'Fail')) {
      return 'Fail';
    }

    if (testResults.some((item) => item.result === 'Blocked')) {
      return 'Blocked';
    }

    if (testResults.some((item) => item.result === 'Not Executed')) {
      return 'Not Executed';
    }

    return 'Pass';
  }

  storeTestResult(test) {
    const title = test.fullTitle();
    const matchedTestCaseKey = title.match(this.testCaseKeyRegex);
    if (matchedTestCaseKey && matchedTestCaseKey.length > 1) {
      const [, testCaseId] = matchedTestCaseKey;
      const testCaseKey = `${this.projectKey}-${testCaseId}`;
      const result = this.convertStatus(test.state);
      const comment = test.isFailed()
        ? `<b>❌ Error Message: </b> <br> <span style="color: rgb(226, 80, 65);">${test.err?.name} - ${test.err?.message
          // @ts-expect-error - TODO: fix this
        }</span> <br> <br> <b>📍 Code Frame:</b> <br> <span style="color: rgb(226, 80, 65);">${test.err?.codeFrame?.frame?.replaceAll('\n', '<br>')}</span> <br> <br> <b> 📂 File Path:</b> <br>${test.err?.codeFrame?.absoluteFile}`
        : undefined;
      this.testResults.push({
        result,
        testCase: {
          key: testCaseKey,
          comment,
        },
      });
    }
  }

  createReport() {
    if (this.testResults.length) {
      if (this.mergeSameTestExecutions) {
        const result = this.getMergeStatus(this.testResults);
        const testCase = this.testResults[0].testCase;

        this.testResults = [
          { result, testCase },
        ];
      }

      (0, child_process_1.spawnSync)('node', [`${__dirname}/create-report.js`], {
        stdio: 'inherit',
        env: Object.assign(process.env, {
          ZEPHYR_PROJECT_KEY: this.projectKey,
          ZEPHYR_TEST_RESULTS: JSON.stringify(this.testResults),
        }),
      });
    } else {
      console.log((0, colors_1.gray)('[zephyr reporter] There\'s no Zephyr test case id in this spec file'));
    }
  }

  setupZephyrReporter() {
    this.mochaRunner
      .on(EVENT_TEST_PASS, (test) => this.storeTestResult(test))
      .on(EVENT_TEST_FAIL, (test) => this.storeTestResult(test))
      .on(EVENT_TEST_PENDING, (test) => this.storeTestResult(test))
      .once(EVENT_RUN_END, () => this.createReport());
  }
}
exports.Reporter = Reporter;
