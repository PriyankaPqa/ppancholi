/**
 * @group entities
 */

import { mockCaseNoteEntity, CaseNoteEntity } from './index';

const mockData = mockCaseNoteEntity();

describe('>>> Case Note', () => {
  describe('>> constructor', () => {
    describe('>> instantiate when data is passed', () => {
      it('should instantiate caseFileId', () => {
        const caseNote = new CaseNoteEntity(mockData);
        expect(caseNote.caseFileId).toEqual(mockData.caseFileId);
      });

      it('should instantiate subject', () => {
        const caseNote = new CaseNoteEntity(mockData);
        expect(caseNote.subject).toEqual(mockData.subject);
      });

      it('should instantiate description', () => {
        const caseNote = new CaseNoteEntity(mockData);
        expect(caseNote.description).toEqual(mockData.description);
      });

      it('should instantiate category', () => {
        const caseNote = new CaseNoteEntity(mockData);
        expect(caseNote.category).toEqual(mockData.category);
      });

      it('should instantiate userCreatedBy', () => {
        const caseNote = new CaseNoteEntity(mockData);
        expect(caseNote.userCreatedBy).toEqual(mockData.userCreatedBy);
      });

      it('should instantiate userUpdatedBy', () => {
        const caseNote = new CaseNoteEntity(mockData);
        expect(caseNote.userUpdatedBy).toEqual(mockData.userUpdatedBy);
      });

      it('should instantiate isPinned', () => {
        const caseNote = new CaseNoteEntity(mockData);
        expect(caseNote.isPinned).toEqual(mockData.isPinned);
      });

      it('should instantiate updatedDate', () => {
        const caseNote = new CaseNoteEntity(mockData);
        expect(caseNote.updatedDate).toEqual(new Date(mockData.updatedDate));
      });
    });

    describe('>> instantiate when data is not passed', () => {
      it('should instantiate caseFileId', () => {
        const caseNote = new CaseNoteEntity();
        expect(caseNote.caseFileId).toEqual(null);
      });

      it('should instantiate subject', () => {
        const caseNote = new CaseNoteEntity();
        expect(caseNote.subject).toEqual(null);
      });

      it('should instantiate description', () => {
        const caseNote = new CaseNoteEntity();
        expect(caseNote.description).toEqual(null);
      });

      it('should instantiate category', () => {
        const caseNote = new CaseNoteEntity();
        expect(caseNote.category).toEqual(null);
      });

      it('should instantiate userCreatedBy', () => {
        const caseNote = new CaseNoteEntity();
        expect(caseNote.userCreatedBy).toEqual(null);
      });

      it('should instantiate userUpdatedBy', () => {
        const caseNote = new CaseNoteEntity();
        expect(caseNote.userUpdatedBy).toEqual(null);
      });

      it('should instantiate isPinned', () => {
        const caseNote = new CaseNoteEntity();
        expect(caseNote.isPinned).toEqual(false);
      });

      it('should instantiate updatedDate', () => {
        const caseNote = new CaseNoteEntity();
        expect(caseNote.updatedDate).toEqual(null);
      });
    });
  });

  describe('>> validation', () => {
    describe('> validation attributes', () => {
      test('subject is required', () => {
        const caseNote = new CaseNoteEntity(mockData);

        caseNote.subject = null;

        expect(caseNote.validate()).toContain('The subject is required');
      });

      test('description id is required', () => {
        const caseNote = new CaseNoteEntity(mockData);

        caseNote.description = null;

        expect(caseNote.validate()).toContain('The description is required');
      });

      test('category is required', () => {
        const caseNote = new CaseNoteEntity(mockData);

        caseNote.category = null;

        expect(caseNote.validate()).toContain('The category is required');
      });
    });
  });
});
