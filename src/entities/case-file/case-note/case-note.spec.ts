import { CaseNote } from './case-note';
import { mockCaseNoteSearchData } from './case-note.mock';

const mockData = mockCaseNoteSearchData()[0];

describe('>>> Case Note', () => {
  describe('>> constructor', () => {
    it('should instantiate subject', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.subject).toBe(mockData.subject);
    });

    it('should instantiate description', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.description).toBe(mockData.description);
    });

    it('should instantiate category', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.category.name).toBe(mockData.caseNoteCategoryName);
    });

    it('should instantiate user', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.user.name).toBe(mockData.createdBy.userName);
    });

    it('should instantiate role', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.role.name).toBe(mockData.createdBy.roleName);
    });

    it('should instantiate lastModifiedByFullName', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.lastModifiedByFullName).toBe(mockData.createdBy.userName);
    });
  });

  describe('>> validation', () => {
    describe('> validation attributes', () => {
      test('subject is required', () => {
        const caseNote = new CaseNote(mockData);

        caseNote.subject = null;

        expect(caseNote.validate()).toContain('The subject is required');
      });

      test('description id is required', () => {
        const caseNote = new CaseNote(mockData);

        caseNote.description = null;

        expect(caseNote.validate()).toContain('The description is required');
      });

      test('category is required', () => {
        const caseNote = new CaseNote(mockData);

        caseNote.category = null;

        expect(caseNote.validate()).toContain('The category is required');
      });
    });
  });
});
