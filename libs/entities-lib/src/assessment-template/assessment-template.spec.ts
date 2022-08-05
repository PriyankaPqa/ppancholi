import {
  mockAssessmentTemplateEntity, AssessmentTemplateEntity,
} from './index';

const mockData = mockAssessmentTemplateEntity();

describe('>>> Assessment template', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should instantiate name', () => {
        const item = new AssessmentTemplateEntity(mockData);
        expect(item.name).toEqual(mockData.name);
      });
    });
  });
});
