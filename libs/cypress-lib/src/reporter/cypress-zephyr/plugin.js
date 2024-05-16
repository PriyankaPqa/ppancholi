"use strict";
const before_hook_1 = require("./before-hook");
const after_hook_1 = require("./after-hook");
module.exports = (on) => {
    on('before:run', before_hook_1.beforeRunHook);
    on('after:run', after_hook_1.afterRunHook);
};
