import { IErrorReportingServiceMock } from './errorReporting.types';

export const mockErrorReportingService = (): IErrorReportingServiceMock => ({
  sendErrorReport: jest.fn(),
});
