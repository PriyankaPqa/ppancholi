"use strict";
const mocha_1 = require("mocha");
const reporter_1 = require("./reporter");
class BaseReporter extends mocha_1.reporters.Spec {
    reporter;
    constructor(runner, options) {
        super(runner, options);
        this.reporter = new reporter_1.Reporter(runner, options.reporterOptions.projectKey);
        this.reporter.setupZephyrReporter();
    }
}
module.exports = BaseReporter;
