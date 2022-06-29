import { IHttpMock, mockHttp } from '@libs/core-lib/services/http-client';
import { CaseFilesMetadataService } from './case-files';

describe('>>> Case File Metadata Service', () => {
  let http: IHttpMock;
  let service: CaseFilesMetadataService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseFilesMetadataService(http as never);
  });

  describe('getSummary', () => {
    it('is linked to the correct URL and params', async () => {
      const id = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';

      await service.getSummary(id);

      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}/summary`);
    });
  });
});
