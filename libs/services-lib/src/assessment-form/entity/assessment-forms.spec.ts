import { mockAssessmentFormEntity } from '@libs/entities-lib/src/assessment-template';
import { IHttpMock, mockHttp, GlobalHandler } from '../../http-client';
import { AssessmentFormsService } from './assessment-forms';

describe('>>> AssessmentForms Service', () => {
  let http: IHttpMock;
  let service: AssessmentFormsService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new AssessmentFormsService(http as never);
  });

  describe('getForBeneficiary', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentFormEntity();
      await service.getForBeneficiary(entity.id);
      expect(http.get).toHaveBeenCalledWith(`www.test.com/assessment/assessment-forms/${entity.id}/public`, { globalHandler: GlobalHandler.Partial });
    });
  });

  describe('fetchByProgramId', () => {
    it('is linked to the correct URL and params', async () => {
      await service.fetchByProgramId('programId');
      expect(http.get).toHaveBeenCalledWith('assessment/programs/programId/assessment-forms');
    });
  });

  describe('search', () => {
    it('should call the proper endpoint if a searchEndpoint parameter is passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`assessment/search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('assessment/search/assessment-forms', { params, isOData: true });
    });
  });

  describe('create', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentFormEntity();
      await service.create(entity);
      expect(http.post).toHaveBeenCalledWith('www.test.com/assessment/assessment-forms', entity, {
        globalHandler: GlobalHandler.Partial,
        transformRequest: [expect.any(Function)],
      });
    });
  });

  describe('update', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentFormEntity();
      await service.update(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-forms/${entity.id}`, entity, {
        globalHandler: GlobalHandler.Partial,
        transformRequest: [expect.any(Function)],
      });
    });
  });

  describe('updateAssessmentStructure', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentFormEntity();
      await service.updateAssessmentStructure(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-forms/${entity.id}/updateAssessmentStructure`, entity, {
        transformRequest: [expect.any(Function)],
      });
    });
  });

  describe('htmlToWord', () => {
    it('is linked to the correct URL and params', async () => {
      const ret = await service.htmlToWord('some data', 'file.docx');
      expect(http.postFullResponse).toHaveBeenCalledWith('assessment/tools/HtmlToWord/extract.docx', 'some data', {
        responseType: 'blob', transformRequest: [expect.any(Function)] });
      expect(http.getRestResponseAsFile).toHaveBeenCalled();
      expect(ret).toEqual('myUrl');
    });
  });
});
