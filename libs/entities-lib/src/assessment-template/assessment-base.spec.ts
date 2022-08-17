import {
  mockAssessmentBaseEntity, AssessmentBaseEntity, SurveyJsAssessmentFormState,
} from './index';
import utils from '../utils';

const mockData = mockAssessmentBaseEntity();

describe('>>> Assessment base', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should instantiate info', () => {
        const item = new AssessmentBaseEntity(mockData);
        expect(item.name).toEqual(mockData.name);
        expect(item.status).toEqual(mockData.status);
        expect(item.savePartialSurveyResults).toEqual(mockData.savePartialSurveyResults);
        expect(item.description).toEqual(mockData.description);
        expect(item.messageIfUnavailable).toEqual(mockData.messageIfUnavailable);
        expect(item.publishStatus).toEqual(mockData.publishStatus);
        expect(item.assessmentFormType).toEqual(mockData.assessmentFormType);
        expect(item.externalToolState).toEqual(mockData.externalToolState);
        expect(item.questions).toEqual(mockData.questions);
      });
      it('should instantiate on empty', () => {
        const item = new AssessmentBaseEntity();
        expect(item.name).toEqual(utils.initMultilingualAttributes());
        expect(item.status).toEqual(1);
        expect(item.description).toEqual(utils.initMultilingualAttributes());
        expect(item.messageIfUnavailable).toEqual(utils.initMultilingualAttributes());
        expect(item.publishStatus).toEqual(1);
        expect(item.externalToolState).toEqual(new SurveyJsAssessmentFormState(null));
        expect(item.questions).toEqual([]);
      });
    });
  });

  describe('fillEmptyMultilingualAttributes', () => {
    it('calls utils.getFilledMultilingualField and assigns the result to name', async () => {
      const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-value-en' } }));
      const item = new AssessmentBaseEntity();
      item.fillEmptyMultilingualAttributes();
      expect(item.name).toEqual({ translation: { en: 'mock-value-en' } });
      spy.mockRestore();
    });
    it('calls utils.getFilledMultilingualField and assigns the result to description', async () => {
      const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-value-en' } }));
      const item = new AssessmentBaseEntity();
      item.fillEmptyMultilingualAttributes();
      expect(item.description).toEqual({ translation: { en: 'mock-value-en' } });
      spy.mockRestore();
    });
    it('calls utils.getFilledMultilingualField and assigns the result to messageIfUnavailable', async () => {
      const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-value-en' } }));
      const item = new AssessmentBaseEntity();
      item.fillEmptyMultilingualAttributes();
      expect(item.messageIfUnavailable).toEqual({ translation: { en: 'mock-value-en' } });
      spy.mockRestore();
    });
  });
});
