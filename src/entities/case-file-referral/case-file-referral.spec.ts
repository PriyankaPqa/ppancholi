import {
  mockCaseFileReferralEntity, CaseFileReferralEntity,
} from './index';

const mockData = mockCaseFileReferralEntity();

describe('>>> Case File', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should instantiate caseFileId', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.caseFileId).toEqual(mockData.caseFileId);
      });

      it('should instantiate name', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.name).toEqual(mockData.name);
      });

      it('should instantiate note', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.note).toEqual(mockData.note);
      });

      it('should instantiate method', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.method).toEqual(mockData.method);
      });

      it('should instantiate type', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.type).toEqual(mockData.type);
      });

      it('should instantiate outcomeStatus', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.outcomeStatus).toEqual(mockData.outcomeStatus);
      });

      it('should instantiate name', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.name).toEqual(mockData.name);
      });
    });
  });

  describe('>> validation', () => {
    test('true is returned for a valid entity', () => {
      const item = new CaseFileReferralEntity(mockData);
      expect(item.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      test('case file id is required', () => {
        const item = new CaseFileReferralEntity(mockData);
        item.caseFileId = null;
        expect(item.validate()).toContain('The case file id is required');
      });

      test('The name is required', () => {
        const item = new CaseFileReferralEntity(mockData);
        item.name = null;
        expect(item.validate()).toContain('The name is required');
      });
    });
  });
});
