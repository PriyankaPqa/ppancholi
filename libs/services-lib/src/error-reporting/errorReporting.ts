import { IErrorReport } from '@libs/shared-lib/types';
import { GlobalHandler, IHttpClient } from '../http-client';
import { IErrorReportingService } from './errorReporting.types';

export class ErrorReportingService implements IErrorReportingService {
  constructor(private readonly http: IHttpClient) {}

  async sendErrorReport(payload: IErrorReport): Promise<void> {
    return this.http.post('system-management/error-reporting/send', { errorReportingForSupport: payload }, { globalHandler: GlobalHandler.Partial });
  }
}
