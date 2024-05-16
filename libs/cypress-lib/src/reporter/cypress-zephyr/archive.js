"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJsonReport = exports.archiveReport = exports.cypressReportPath = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const adm_zip_1 = __importDefault(require("adm-zip"));
exports.cypressReportPath = 'cypress/reports/zephyr';
function archiveReport(filename, reportPath) {
    try {
        const zip = new adm_zip_1.default();
        const jsonReportPath = (0, node_path_1.join)(process.cwd(), reportPath, filename);
        const zipPath = (0, node_path_1.join)(process.cwd(), reportPath, `${filename}.zip`);
        zip.addLocalFile(jsonReportPath);
        zip.writeZip(zipPath);
        return zipPath;
    }
    catch (error) {
        console.error(`Failed to prepare reporter archive: ${error}`);
        throw error;
    }
}
exports.archiveReport = archiveReport;
function createReporterDirectory(filePath) {
    if (!(0, node_fs_1.existsSync)(filePath)) {
        (0, node_fs_1.mkdirSync)(filePath, { recursive: true });
    }
}
function createJsonReport(filename, filePath, executions) {
    const jsonReport = JSON.stringify({ version: 1, executions: executions }, null, 2);
    const jsonReportPath = (0, node_path_1.join)(process.cwd(), filePath, filename);
    try {
        createReporterDirectory(filePath);
        (0, node_fs_1.writeFileSync)(jsonReportPath, jsonReport);
        return jsonReportPath;
    }
    catch (error) {
        console.error(`Failed to create reporter JSON: ${error}`);
        throw error;
    }
}
exports.createJsonReport = createJsonReport;
