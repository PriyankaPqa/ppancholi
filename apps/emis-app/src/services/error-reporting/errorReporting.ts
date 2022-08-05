import { IErrorReport } from '@libs/core-lib/types';
import { IHttpClient } from '@libs/core-lib/services/http-client';
import { IErrorReportingService } from './errorReporting.types';

export class ErrorReportingService implements IErrorReportingService {
  constructor(private readonly http: IHttpClient) {}

  async sendErrorReport(payload: IErrorReport): Promise<void> {
    return this.http.post('system-management/error-reporting/send', { errorReportingForSupport: payload }, { globalHandler: false });
  }
}
