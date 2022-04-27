import { mockCaseNoteEntity } from '@/entities/case-note';
import { IHttpMock, mockHttp } from '@libs/core-lib/services/http-client';
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
      const id = 'id';
      const caseNote = mockCaseNoteEntity();
      await service.addCaseNote(id, caseNote);
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/case-notes`, {
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
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${caseFileId}/case-notes/${caseNoteId}/pin/${isPinned}`);
    });
  });

  describe('editCaseNote', () => {
    it('is linked to the correct URL and params', async () => {
      const caseFileId = 'case file id';
      const caseNoteId = 'case note id';
      const caseNote = mockCaseNoteEntity();
      await service.editCaseNote(caseFileId, caseNoteId, caseNote);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${caseFileId}/case-notes/${caseNoteId}/edit`, {
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
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`case-file/search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('case-file/search/case-notes', { params, isOData: true });
    });
  });
});
