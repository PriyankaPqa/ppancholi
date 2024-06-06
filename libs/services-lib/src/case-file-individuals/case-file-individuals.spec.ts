import { mockCaseFileIndividualEntity, mockReceivingAssistanceDetails } from '@libs/entities-lib/case-file-individual';
import { GlobalHandler, IHttpMock, mockHttp } from '../http-client';
import { CaseFileIndividualsService } from './case-file-individuals';

describe('>>> Case File Individual Service', () => {
  let http: IHttpMock;
  let service: CaseFileIndividualsService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseFileIndividualsService(http as never);
  });

  describe('get', () => {
    it('is linked to the correct URL and params', async () => {
      const id = { id: 'myId', caseFileId: 'myParent' };
      await service.get(id);
      expect(http.get).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/case-file-individuals/myId', { globalHandler: GlobalHandler.Enabled });
    });
  });

  describe('createCaseFileIndividual', () => {
    it('is linked to the correct URL and params', async () => {
      const entity = mockCaseFileIndividualEntity();
      entity.caseFileId = 'myParent';
      await service.createCaseFileIndividual(entity);
      expect(http.post).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/case-file-individuals', entity);
    });
  });

  describe('addReceiveAssistanceDetails', () => {
    it('is linked to the correct URL and params', async () => {
      const entity = mockReceivingAssistanceDetails();
      await service.addReceiveAssistanceDetails('myParent', 'someId', entity);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/case-file-individuals/someId/add-receive-assistance-details', entity);
    });
  });
});
