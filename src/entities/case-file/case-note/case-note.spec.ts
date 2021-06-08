import { CaseNote } from './case-note';
import { mockCaseNoteSearchData } from './case-note.mock';

const mockData = mockCaseNoteSearchData()[0];

describe('>>> Case Note', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.id).toBe(mockData.id);
    });

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

    it('should instantiate created', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.created).toBe(mockData.caseNoteCreatedDate);
    });

    it('should instantiate user', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.user.name).toBe(mockData.createdBy.userName);
    });

    it('should instantiate role', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.role.name).toBe(mockData.createdBy.roleName);
    });

    it('should instantiate lastModifiedDate if updatedBy exists', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.lastModifiedDate).toBe(mockData.caseNoteUpdatedDate);
    });

    it('should instantiate lastModifiedByFullName if updatedBy exists', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.lastModifiedByFullName).toBe(mockData.updatedBy.userName);
    });

    it('should instantiate lastModifiedDate with createdBy if updatedBy not exists', () => {
      mockData.updatedBy = null;

      const caseNote = new CaseNote(mockData);
      expect(caseNote.lastModifiedDate).toBe(mockData.caseNoteCreatedDate);
    });

    it('should instantiate lastModifiedByFullName with createdBy if updatedBy not exists', () => {
      mockData.updatedBy = null;

      const caseNote = new CaseNote(mockData);
      expect(caseNote.lastModifiedByFullName).toBe(mockData.createdBy.userName);
    });

    it('should instantiate isPinned', () => {
      const caseNote = new CaseNote(mockData);
      expect(caseNote.isPinned).toBe(mockData.isPinned);
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
