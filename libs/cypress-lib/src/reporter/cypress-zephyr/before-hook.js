Object.defineProperty(exports, '__esModule', { value: true });
exports.beforeRunHook = void 0;
const node_fs_1 = require('node:fs');
const archive_1 = require('./archive');

function validateOptions(options) {
  if (options.cypressZephyrReporterOptions) {
    options = options.cypressZephyrReporterOptions;
  }

  if (options.libsCypressLibSrcReporterCypressZephyrReporterOptions) {
    options = options.libsCypressLibSrcReporterCypressZephyrReporterOptions;
  }

  if (!options.projectKey) {
    throw new Error('[zephyr reporter] "projectKey" is required');
  }
  if (!options.authorizationToken) {
    throw new Error('[zephyr reporter] "authorizationToken" env is required');
  }
}
function beforeRunHook(details) {
  validateOptions(details.config.reporterOptions);
  try {
    if (!(0, node_fs_1.existsSync)(archive_1.cypressReportPath)) {
      return;
    }
    const files = (0, node_fs_1.readdirSync)(archive_1.cypressReportPath);
    for (const file of files) {
      (0, node_fs_1.unlinkSync)(`${archive_1.cypressReportPath}/${file}`);
    }
  } catch (error) {
    console.error(`[zephyr reporter] Failed to clean up previous reports: ${error}`);
  }
}
exports.beforeRunHook = beforeRunHook;
