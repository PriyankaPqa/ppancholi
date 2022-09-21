import { mockAssessmentResponseEntity } from '@libs/entities-lib/src/assessment-template';
import { IHttpMock, mockHttp } from '../../http-client';
import { AssessmentResponsesService } from './assessment-responses';

describe('>>> AssessmentResponses Service', () => {
  let http: IHttpMock;
  let service: AssessmentResponsesService;

  beforeEach(() => {
    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    jest.clearAllMocks();
    http = mockHttp();
    service = new AssessmentResponsesService(http as never);
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
      expect(http.get).toHaveBeenCalledWith('assessment/search/assessment-responses', { params, isOData: true });
    });
  });

  describe('create', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentResponseEntity();
      await service.create(entity);
      expect(http.post).toHaveBeenCalledWith('www.test.com/assessment/assessment-responses', entity, { globalHandler: false });
    });
  });

  describe('update', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentResponseEntity();
      await service.update(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-responses/${entity.id}`, entity, { globalHandler: false });
    });
  });

  describe('saveAssessmentAnsweredQuestions', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentResponseEntity();
      await service.saveAssessmentAnsweredQuestions(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-responses/${entity.id}/saveAssessmentAnsweredQuestions`, entity);
    });
  });
});
