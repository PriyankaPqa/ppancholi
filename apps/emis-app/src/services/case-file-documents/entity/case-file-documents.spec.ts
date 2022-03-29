/* eslint-disable */
import { ICaseFileDocumentEntity, mockCaseFileDocumentEntity } from '@/entities/case-file-document';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { CaseFileDocumentsService } from './case-file-documents';

describe('>>> Case File Document Service', () => {
  let http: IHttpMock;
  let service: CaseFileDocumentsService;
  let entity: ICaseFileDocumentEntity;

  beforeEach(() => {
    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    entity = mockCaseFileDocumentEntity();
    entity.id = 'myId';
    entity.caseFileId = 'myParent';
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseFileDocumentsService(http as never);
  });

  describe('updateDocument', () => {
    it('is linked to the correct URL and params', async () => {
      await service.updateDocument(entity);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/documents/myId/edit',
        entity);
    });
  });

  describe('downloadDocumentAsUrl', () => {
    it('is linked to the correct URL and params and returns the url', async () => {
      window.URL.createObjectURL = jest.fn(() => 'myUrl');
      const ret = await service.downloadDocumentAsUrl(entity, false);
      expect(http.getFullResponse).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/documents/myId/file', { responseType: 'blob' });
      expect(ret).toEqual('myUrl');
    });
  });

  describe('search', () => {
    it('is linked to the correct URL and params', async () => {
      await service.search(null);
      expect(http.get).toHaveBeenCalledWith('case-file/search/documents', {params: null, isOData: true, })
    });
  });

});
