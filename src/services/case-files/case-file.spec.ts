import {
  ICaseFileLabel, mockCaseFilesSearchData, ECaseFileTriage, ECaseFileStatus,
} from '@/entities/case-file';
import { mockCaseNote } from '@/entities/case-file/case-note';
import { mockHttp } from '@/services/httpClient.mock';
import { mockSearchParams } from '@/test/helpers';
import { IListOption } from '@/types';
import { CaseFilesService } from './case-files';

const http = mockHttp();

describe('>>> Case File Service', () => {
  const service = new CaseFilesService(http as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchCaseFiles', () => {
    it('is linked to the correct URL and params', async () => {
      const params = mockSearchParams;
      await service.searchCaseFiles(params);
      expect(http.get).toHaveBeenCalledWith('/search/case-file-projections', { params, isOData: true });
    });
  });

  describe('fetchCaseFileActivities', () => {
    it('is linked to the correct URL and params', async () => {
      const id = 'MOCK_ID';
      await service.fetchCaseFileActivities(id);
      expect(http.get).toHaveBeenCalledWith(`/case-file/case-files/${id}/activities`);
    });
  });

  describe('setCaseFileTags', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const payload: IListOption[] = [{ optionItemId: 'foo', specifiedOther: null }];

      await service.setCaseFileTags(id, payload);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/tags`, { tags: payload });
    });
  });

  describe('setCaseFileStatus - inactive', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const status: ECaseFileStatus = ECaseFileStatus.Inactive;
      const rationale = 'Some rationale';
      const reason: IListOption = { optionItemId: 'foo', specifiedOther: null };

      await service.setCaseFileStatus(id, status, rationale, reason);
      expect(http.patch).toHaveBeenCalledWith(`case-file/case-files/${id}/deactivate`, { reason, rationale });
    });
  });

  describe('setCaseFileStatus - archive', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const status: ECaseFileStatus = ECaseFileStatus.Archived;

      await service.setCaseFileStatus(id, status, null, null);
      expect(http.patch).toHaveBeenCalledWith(`case-file/case-files/${id}/archive`, {});
    });
  });

  describe('setCaseFileStatus - reopen', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const status: ECaseFileStatus = ECaseFileStatus.Open;
      const rationale = 'Some rationale';

      await service.setCaseFileStatus(id, status, rationale, null);
      expect(http.patch).toHaveBeenCalledWith(`case-file/case-files/${id}/reopen`, { rationale });
    });
  });

  describe('setCaseFileStatus - close', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const status: ECaseFileStatus = ECaseFileStatus.Closed;
      const rationale = 'Some rationale';
      const reason: IListOption = { optionItemId: 'foo', specifiedOther: null };

      await service.setCaseFileStatus(id, status, rationale, reason);
      expect(http.patch).toHaveBeenCalledWith(`case-file/case-files/${id}/close`, { rationale, reason });
    });
  });

  describe('setCaseFileLabels', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const payload: ICaseFileLabel[] = [
        {
          name: 'Label One',
          order: 1,
        },
        {
          name: 'Label Two',
          order: 2,
        },
      ];

      await service.setCaseFileLabels(id, payload);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/labels`, { labels: payload });
    });
  });

  describe('setCaseFileIsDuplicate', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const isDuplicate = true;

      await service.setCaseFileIsDuplicate(id, isDuplicate);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/is-duplicate`, { isDuplicate });
    });
  });

  describe('fetchActiveCaseNoteCategories', () => {
    it('is linked to the correct URL and params', async () => {
      await service.fetchActiveCaseNoteCategories();
      expect(http.get).toHaveBeenCalledWith('/case-file/case-note-categories');
    });
  });

  describe('addCaseNote', () => {
    it('is linked to the correct URL and params', async () => {
      const id = 'id';
      const caseNote = mockCaseNote();
      await service.addCaseNote(id, caseNote);
      expect(http.post).toHaveBeenCalledWith(`/case-file/case-files/${id}/case-notes`, {
        subject: caseNote.subject,
        description: caseNote.description,
        category: {
          optionItemId: caseNote.category.id,
        },
      });
    });
  });

  describe('editCaseNote', () => {
    it('is linked to the correct URL and params', async () => {
      const caseFileId = 'case file id';
      const caseNoteId = 'case note id';
      const caseNote = mockCaseNote();
      await service.editCaseNote(caseFileId, caseNoteId, caseNote);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${caseFileId}/case-notes/${caseNoteId}/edit`, {
        subject: caseNote.subject,
        description: caseNote.description,
        category: {
          optionItemId: caseNote.category.id,
        },
      });
    });
  });

  describe('searchCaseNotes', () => {
    it('is linked to the correct URL and params', async () => {
      const params = mockSearchParams;
      await service.searchCaseNotes(params);
      expect(http.get).toHaveBeenCalledWith('/search/case-note-projections', { params, isOData: true });
    });
  });

  describe('setCaseFileTriage', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const triage = ECaseFileTriage.Tier1;

      await service.setCaseFileTriage(id, triage);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/triage`, { triage });
    });
  });

  describe('setCaseFileAssign', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const individuals = ['mock-individual-id'];
      const teams = ['mock-teams-id'];

      await service.setCaseFileAssign(id, individuals, teams);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/assign`, { individuals, teams });
    });
  });
});
