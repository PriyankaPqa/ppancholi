Object.defineProperty(exports, '__esModule', { value: true });
const node_fs_1 = require('node:fs');
const service_1 = require('./service');
const archive_1 = require('./archive');

function mergeZephyrReports() {
  const mergedReportName = `zephyr-merged-report-${new Date().getTime()}.json`;
  if ((0, node_fs_1.existsSync)(archive_1.cypressReportPath)) {
    const files = (0, node_fs_1.readdirSync)(archive_1.cypressReportPath);
    const zephyrReports = files.filter((file) => file.startsWith('zephyr-report-') && file.endsWith('.json'));
    const mergedReport = { version: 1, executions: [] };
    for (const report of zephyrReports) {
      const reportData = JSON.parse((0, node_fs_1.readFileSync)(`./${archive_1.cypressReportPath}/${report}`, 'utf-8'));
      if (Array.isArray(reportData.executions)) {
        mergedReport.executions.push(...reportData.executions);
      }
      // (0, node_fs_1.unlinkSync)(`./${archive_1.cypressReportPath}/${report}`);
    }
    if (mergedReport.executions.length) {
      (0, node_fs_1.writeFileSync)(`./${archive_1.cypressReportPath}/${mergedReportName}`, JSON.stringify(mergedReport, null, 2));
      return mergedReportName;
    }
  }
  return null;
}
function getZephyrOptions(results) {
  if (results.config.reporter === 'cypress-multi-reporters'
        && results.config.reporterOptions.reporterEnabled.includes('cypress-zephyr')) {
    return {
      projectKey: results.config.reporterOptions.cypressZephyrReporterOptions.projectKey,
      authorizationToken: results.config.reporterOptions.cypressZephyrReporterOptions.authorizationToken,
      testCycle: results.config.reporterOptions.cypressZephyrReporterOptions.testCycle,
      autoCreateTestCases: results.config.reporterOptions.cypressZephyrReporterOptions.autoCreateTestCases,
      nodeInternalTlsRejectUnauthorized: results.config.reporterOptions.cypressZephyrReporterOptions.nodeInternalTlsRejectUnauthorized,
    };
  }

  if (results.config.reporter === 'cypress-multi-reporters'
    && results.config.reporterOptions.reporterEnabled.includes('../../libs/cypress-lib/src/reporter/cypress-zephyr')) {
    return {
      projectKey: results.config.reporterOptions.libsCypressLibSrcReporterCypressZephyrReporterOptions.projectKey,
      authorizationToken: results.config.reporterOptions.libsCypressLibSrcReporterCypressZephyrReporterOptions.authorizationToken,
      testCycle: results.config.reporterOptions.libsCypressLibSrcReporterCypressZephyrReporterOptions.testCycle,
      autoCreateTestCases: results.config.reporterOptions.libsCypressLibSrcReporterCypressZephyrReporterOptions.autoCreateTestCases,
      nodeInternalTlsRejectUnauthorized: results.config.reporterOptions.libsCypressLibSrcReporterCypressZephyrReporterOptions.nodeInternalTlsRejectUnauthorized,
    };
  }
  return {
    projectKey: results.config.reporterOptions.projectKey,
    authorizationToken: results.config.reporterOptions.authorizationToken,
    testCycle: results.config.reporterOptions.testCycle,
    autoCreateTestCases: results.config.reporterOptions.autoCreateTestCases,
    nodeInternalTlsRejectUnauthorized: results.config.reporterOptions.nodeInternalTlsRejectUnauthorized,
  };
}
function afterRunHook(results) {
  const zephyrReportJsonPath = mergeZephyrReports();
  if (zephyrReportJsonPath) {
    const zephyrReportZipPath = (0, archive_1.archiveReport)(zephyrReportJsonPath, archive_1.cypressReportPath);
    const zephyrOptions = getZephyrOptions(results);
    const zephyrService = new service_1.Service(zephyrOptions);
    return zephyrService.createTestCycle(zephyrReportZipPath);
  }
  console.log('[zephyr reporter]: No zephyr reports found. Skipping cycle creation...');
}

exports.afterRunHook = afterRunHook;
