"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printReport = void 0;
const colors_1 = require("colors");
const table_1 = require("table");
function printReport(testCycle) {
    const tableData = [
        [(0, colors_1.bold)((0, colors_1.green)(`✅ Test cycle ${testCycle.key} has been created`))],
        [(0, colors_1.bold)((0, colors_1.gray)('👇 Check out the test result'))],
        [(0, colors_1.bold)((0, colors_1.blue)(`🔗 ${testCycle.url}`))],
    ];
    const report = (0, table_1.table)(tableData, {
        border: (0, table_1.getBorderCharacters)('norc'),
        singleLine: true,
    });
    console.log((0, colors_1.bold)('\n📋 Zephyr Scale Report details:'));
    console.log(report);
}
exports.printReport = printReport;
