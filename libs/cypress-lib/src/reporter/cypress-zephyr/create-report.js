"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const archive_1 = require("./archive");
const testResults = JSON.parse(process.env['ZEPHYR_TEST_RESULTS']);
console.log(testResults)
const zephyrReportName = `zephyr-report-${new Date().getTime()}.json`;
(0, archive_1.createJsonReport)(zephyrReportName, archive_1.cypressReportPath, testResults);
