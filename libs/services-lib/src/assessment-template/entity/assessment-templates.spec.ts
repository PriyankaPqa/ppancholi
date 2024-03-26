import { mockAssessmentTemplateEntity } from '@libs/entities-lib/src/assessment-template';
import { IHttpMock, mockHttp, GlobalHandler } from '../../http-client';
import { AssessmentTemplatesService } from './assessment-templates';

describe('>>> AssessmentTemplates Service', () => {
  let http: IHttpMock;
  let service: AssessmentTemplatesService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new AssessmentTemplatesService(http as never);
  });

  describe('search', () => {
    it('should call the proper endpoint', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('assessment/search/assessment-templatesV2', { params, isODataSql: true });
    });
  });

  describe('create', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentTemplateEntity();
      await service.create(entity);
      expect(http.post).toHaveBeenCalledWith('www.test.com/assessment/assessment-templates', entity, {
        globalHandler: GlobalHandler.Partial, transformRequest: [expect.any(Function)] });
    });
  });

  describe('update', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentTemplateEntity();
      await service.update(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-templates/${entity.id}`, entity, {
        globalHandler: GlobalHandler.Partial, transformRequest: [expect.any(Function)] });
    });
  });

  describe('updateAssessmentStructure', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentTemplateEntity();
      await service.updateAssessmentStructure(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-templates/${entity.id}/updateAssessmentStructure`, entity, {
       transformRequest: [expect.any(Function)] });
    });
  });
});
