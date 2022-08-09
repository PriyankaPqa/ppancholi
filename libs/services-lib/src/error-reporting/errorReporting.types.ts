import { IErrorReport } from '@libs/shared-lib/types';

export interface IErrorReportingService {
  sendErrorReport(payload: IErrorReport): Promise<void>;
}

export interface IErrorReportingServiceMock {
  sendErrorReport: jest.Mock<void>;
}
