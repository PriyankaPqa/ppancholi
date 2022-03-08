import {
  mockCaseFileDocumentEntity, CaseFileDocumentEntity,
} from './index';

const mockData = mockCaseFileDocumentEntity();

describe('>>> Case File Document', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should instantiate caseFileId', () => {
        const item = new CaseFileDocumentEntity(mockData);
        expect(item.caseFileId).toEqual(mockData.caseFileId);
      });

      it('should instantiate name', () => {
        const item = new CaseFileDocumentEntity(mockData);
        expect(item.name).toEqual(mockData.name);
      });

      it('should instantiate file name', () => {
        const item = new CaseFileDocumentEntity(mockData);
        expect(item.originalFilename).toEqual(mockData.originalFilename);
      });

      it('should instantiate note', () => {
        const item = new CaseFileDocumentEntity(mockData);
        expect(item.note).toEqual(mockData.note);
      });

      it('should instantiate category', () => {
        const item = new CaseFileDocumentEntity(mockData);
        expect(item.category).toEqual(mockData.category);
      });

      it('should instantiate documentStatus', () => {
        const item = new CaseFileDocumentEntity(mockData);
        expect(item.documentStatus).toEqual(mockData.documentStatus);
      });
    });
  });

  describe('>> validation', () => {
    test('true is returned for a valid entity', () => {
      const item = new CaseFileDocumentEntity(mockData);
      expect(item.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      test('case file id is required', () => {
        const item = new CaseFileDocumentEntity(mockData);
        item.caseFileId = null;
        expect(item.validate()).toContain('The case file id is required');
      });

      test('The name is required', () => {
        const item = new CaseFileDocumentEntity(mockData);
        item.name = null;
        expect(item.validate()).toContain('The name is required');
      });
    });
  });
});
