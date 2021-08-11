/* eslint-disable */
import { mockCaseFileDocumentEntity } from '@/entities/case-file-document';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { CaseFileDocumentsService } from './case-file-documents';

describe('>>> Case File Document Service', () => {
  let http: IHttpMock;
  let service: CaseFileDocumentsService;

  beforeEach(() => {
    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseFileDocumentsService(http as never);
  });
  
  describe('updateDocument', () => {
    it('is linked to the correct URL and params', async () => {
      const entity = mockCaseFileDocumentEntity();
      entity.id = 'myId';
      entity.caseFileId = 'myParent';
      await service.updateDocument(entity);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/documents/myId/edit',
        entity);
    });
  });

});
