import { mockHttp } from '@libs/core-lib/services/http-client';
import { ErrorReportingService } from './errorReporting';

const http = mockHttp();
describe('>>> Error Reporting Service', () => {
  const service = new ErrorReportingService(http as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendErrorReport', () => {
    it('is linked to the correct url', async () => {
      const mockErrorReport = { id: '1234' };
      await service.sendErrorReport(mockErrorReport);
      expect(http.post).toHaveBeenCalledWith('system-management/error-reporting/send', { errorReportingForSupport: mockErrorReport }, { globalHandler: false });
    });
  });
});
