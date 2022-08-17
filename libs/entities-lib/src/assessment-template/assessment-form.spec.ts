import {
  mockAssessmentFormEntity, AssessmentFormEntity,
} from './index';

const mockData = mockAssessmentFormEntity();

describe('>>> Assessment form', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should instantiate name', () => {
        const item = new AssessmentFormEntity(mockData);
        expect(item.name).toEqual(mockData.name);
      });
      it('should instantiate eventId', () => {
        const item = new AssessmentFormEntity(mockData);
        expect(item.eventId).toEqual(mockData.eventId);
      });
      it('should instantiate programId', () => {
        const item = new AssessmentFormEntity(mockData);
        expect(item.programId).toEqual(mockData.programId);
      });
    });
  });
});
