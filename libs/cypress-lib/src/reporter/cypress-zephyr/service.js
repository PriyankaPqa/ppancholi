"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const axios_1 = __importDefault(require("axios"));
const util_1 = require("util");
const fs_1 = require("fs");
const form_data_1 = __importDefault(require("form-data"));
const terminal_reporter_1 = require("./terminal-reporter");
function isAxiosError(error) {
    return error instanceof Error && 'isAxiosError' in error;
}
class Service {
    authorizationToken;
    projectKey;
    testCycle;
    url = 'https://api.zephyrscale.smartbear.com/v2';
    defaultRunName = `Cypress run - [${new Date().toUTCString()}]`;
    constructor(options) {
        this.projectKey = options.projectKey;
        this.authorizationToken = options.authorizationToken;
        this.testCycle = options.testCycle;
    }
    async createTestCycle(testResults) {
        const url = `${this.url}/automations/executions/custom?projectKey=${this.projectKey}&autoCreateTestCases=false`;
        const data = new form_data_1.default();
        const testCycleDefault = {
            name: this.defaultRunName,
            ...this.testCycle,
        };
        data.append('file', (0, fs_1.createReadStream)(testResults));
        data.append('testCycle', JSON.stringify(testCycleDefault), { contentType: 'application/json' });
        try {
            const response = await (0, axios_1.default)({
                url,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.authorizationToken}`,
                    ...data.getHeaders(),
                },
                data,
            });
            if (response.status !== 200)
                throw new Error(`[zephyr reporter]: Failed to create test cycle due to ${response.status} ${response.statusText}\n`);
            const { data: { testCycle }, } = response;
            (0, terminal_reporter_1.printReport)(testCycle);
            return response.data;
        }
        catch (error) {
            this.handleAxiosError(error);
        }
    }
    handleAxiosError(error) {
        if (isAxiosError(error)) {
            console.error(`Config: ${(0, util_1.inspect)(error.config)}`);
            if (error.response) {
                throw new Error(`\nStatus: ${error.response.status} \nHeaders: ${(0, util_1.inspect)(error.response.headers)} \nData: ${(0, util_1.inspect)(error.response.data)}`);
            }
            else if (error.request) {
                throw new Error(`The request was made but no response was received. \n Error: ${(0, util_1.inspect)(error.toJSON())}`);
            }
            else {
                throw new Error(`Something happened in setting up the request that triggered an Error\n : ${(0, util_1.inspect)(error.message)}`);
            }
        }
        throw new Error(`\nUnknown error: ${error}`);
    }
}
exports.Service = Service;
