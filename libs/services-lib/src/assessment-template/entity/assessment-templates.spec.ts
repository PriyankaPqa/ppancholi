import { mockAssessmentTemplateEntity } from '@libs/entities-lib/src/assessment-template';
import { IHttpMock, mockHttp } from '../../http-client';
import { AssessmentTemplatesService } from './assessment-templates';

describe('>>> AssessmentTemplates Service', () => {
  let http: IHttpMock;
  let service: AssessmentTemplatesService;

  beforeEach(() => {
    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    jest.clearAllMocks();
    http = mockHttp();
    service = new AssessmentTemplatesService(http as never);
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
      expect(http.get).toHaveBeenCalledWith('assessment/search/assessment-templates', { params, isOData: true });
    });
  });

  describe('create', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentTemplateEntity();
      await service.create(entity);
      expect(http.post).toHaveBeenCalledWith('www.test.com/assessment/assessment-templates', entity, { globalHandler: false });
    });
  });

  describe('update', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentTemplateEntity();
      await service.update(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-templates/${entity.id}`, entity, { globalHandler: false });
    });
  });

  describe('updateAssessmentStructure', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentTemplateEntity();
      await service.updateAssessmentStructure(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-templates/${entity.id}/updateAssessmentStructure`, entity);
    });
  });
});
