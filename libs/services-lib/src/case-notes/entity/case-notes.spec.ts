import { mockCaseNoteEntity } from '@libs/entities-lib/case-note';
import { IHttpMock, mockHttp } from '../../http-client';
import { CaseNotesService } from './case-notes';

describe('>>> Case Note Service', () => {
  let http: IHttpMock;
  let service: CaseNotesService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseNotesService(http as never);
  });

  describe('addCaseNote', () => {
    it('is linked to the correct URL and params', async () => {
      const id = 'some-cf-id';
      const caseNote = mockCaseNoteEntity();
      await service.addCaseNote(id, caseNote);
      expect(http.post).toHaveBeenCalledWith('www.test.com/case-file/case-files/some-cf-id/case-notes', {
        subject: caseNote.subject,
        description: caseNote.description,
        category: {
          optionItemId: caseNote.category.optionItemId,
        },
      });
    });
  });

  describe('pinCaseNote', () => {
    it('is linked to the correct URL and params', async () => {
      const caseFileId = 'case file id';
      const caseNoteId = 'case note id';
      const isPinned = true;
      await service.pinCaseNote(caseFileId, caseNoteId, isPinned);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/case-file/case-files/${caseFileId}/case-notes/${caseNoteId}/pin/${isPinned}`);
    });
  });

  describe('editCaseNote', () => {
    it('is linked to the correct URL and params', async () => {
      const caseFileId = 'case file id';
      const caseNoteId = 'case note id';
      const caseNote = mockCaseNoteEntity();
      await service.editCaseNote(caseFileId, caseNoteId, caseNote);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/case-file/case-files/${caseFileId}/case-notes/${caseNoteId}/edit`, {
        subject: caseNote.subject,
        description: caseNote.description,
        category: {
          optionItemId: caseNote.category.optionItemId,
        },
      });
    });
  });

  describe('search', () => {
    it('should call the proper endpoint if a searchEndpoint parameter is passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('case-file/search/case-notesV2', { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('case-file/search/case-notesV2', { params, isOData: true });
    });
  });
});
