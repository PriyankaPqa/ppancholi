/* eslint-disable */

import { RequestHook } from 'testcafe';

interface RequestData {
    id: string;
    url: string;
    method: string;
    path: string;
}

interface ResponseData {
    requestId: string;
    statusCode: number;
}

interface ILogItem {
    id: string;
    url: string;
    method: string;
    path: string;
    statusCode: number;
}

export class MyRequestHook extends RequestHook {
    requests: Array<RequestData>

    responses: Array<ResponseData>

    constructor(requestFilterRules?: Array<any>, responseEventConfigureOpts?: Record<string, unknown>) {
      super(requestFilterRules, responseEventConfigureOpts);
      this.requests = [];
      this.responses = [];
    }

    async onRequest(event: Record<string, any>) {
      this.requests.push({
        id: event.requestOptions.requestId,
        url: event.requestOptions.url,
        method: event.requestOptions.method,
        path: event.requestOptions.path,
      });
    }

    async onResponse(event: Record<string, any>) {
      this.responses.push({
        requestId: event.requestId,
        statusCode: event.statusCode,
      });
    }

    getLog(): ILogItem[] {
      const logs: ILogItem[] = [];
      this.requests.forEach((request) => {
        const response = this.responses.find((r) => r.requestId === request.id);
        logs.push({ ...request, statusCode: response?.statusCode });
      });
      return logs;
    }

    getFailures(): ILogItem[] {
      return this.getLog().filter((r) => r.statusCode > 400);
    }

    getRequest(path: string, method: string): ILogItem {
      return this.getLog().find((r) => r.path === path && r.method === method);
    }
}
