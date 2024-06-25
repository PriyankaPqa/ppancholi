import { mockAssessmentResponseEntity } from '@libs/entities-lib/src/assessment-template';
import { IHttpMock, mockHttp, GlobalHandler } from '../../http-client';
import { AssessmentResponsesService } from './assessment-responses';

describe('>>> AssessmentResponses Service', () => {
  let http: IHttpMock;
  let service: AssessmentResponsesService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new AssessmentResponsesService(http as never);
  });

  describe('search', () => {
    it('should call the proper endpoint', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('assessment/search/assessment-responsesV2', { params, isOData: true });
    });
  });

  describe('getForBeneficiary', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentResponseEntity();
      await service.getForBeneficiary(entity.id);
      expect(http.get).toHaveBeenCalledWith(`www.test.com/assessment/assessment-responses/${entity.id}/public`, { globalHandler: GlobalHandler.Partial });
    });
  });

  describe('create', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentResponseEntity();
      await service.create(entity);
      expect(http.post).toHaveBeenCalledWith('www.test.com/assessment/assessment-responses', entity);
    });
  });

  describe('update', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentResponseEntity();
      await service.update(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-responses/${entity.id}`, entity, {
        globalHandler: GlobalHandler.Partial, transformRequest: [expect.any(Function)] });
    });
  });

  describe('saveAssessmentAnsweredQuestions', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentResponseEntity();
      await service.saveAssessmentAnsweredQuestions(entity);
      expect(http.patch).toHaveBeenCalledWith(
`www.test.com/assessment/assessment-responses/${entity.id}/saveAssessmentAnsweredQuestions`,
entity,
{
  transformRequest: [expect.any(Function)] },
);
    });
  });

  describe('completeSurvey', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentResponseEntity();
      await service.completeSurvey(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-responses/${entity.id}/submit`);
    });
  });

  describe('completeSurveyByBeneficiary', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAssessmentResponseEntity();
      await service.completeSurveyByBeneficiary(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/assessment/assessment-responses/${entity.id}/submit/public`);
    });
  });
});
