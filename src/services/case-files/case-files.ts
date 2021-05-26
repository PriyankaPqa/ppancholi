import {
  ICaseFileActivity, ICaseFileData, ICaseFileLabel, ICaseFileSearchData, ICaseNote, ECaseFileTriage, ECaseFileStatus,
} from '@/entities/case-file';
import { IOptionItem } from '@/entities/optionItem';
import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';
import { ICaseFilesService } from './case-files.types';

export class CaseFilesService implements ICaseFilesService {
  constructor(private readonly http: IHttpClient) {}

  async searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFileSearchData>> {
    return this.http.get('/search/case-file-projections', { params, isOData: true });
  }

  async fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]> {
    return this.http.get(`/case-file/case-files/${id}/activities`);
  }

  async setCaseFileStatus(id: uuid, status: ECaseFileStatus, rationale?: string, reason?: IListOption): Promise<ICaseFileData> {
    if (status === ECaseFileStatus.Open) {
      return this.http.patch(`case-file/case-files/${id}/reopen`, {
        rationale,
      });
    }

    if (status === ECaseFileStatus.Closed) {
      return this.http.patch(`case-file/case-files/${id}/close`, {
        reason,
        rationale,
      });
    }

    if (status === ECaseFileStatus.Inactive) {
      return this.http.patch(`case-file/case-files/${id}/deactivate`, {
        reason,
        rationale,
      });
    }

    if (status === ECaseFileStatus.Archived) {
      return this.http.patch(`case-file/case-files/${id}/archive`, {});
    }

    throw new Error('Invalid status');
  }

  async setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/tags`, { tags: payload });
  }

  async setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/labels`, { labels });
  }

  async setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/is-duplicate`, { isDuplicate });
  }

  async fetchActiveCaseNoteCategories(): Promise<IOptionItem[]> {
    return this.http.get('/case-file/case-note-categories');
  }

  async addCaseNote(id: uuid, caseNote: ICaseNote): Promise<ICaseNote[]> {
    return this.http.post(`/case-file/case-files/${id}/case-notes`, {
      subject: caseNote.subject,
      description: caseNote.description,
      category: {
        optionItemId: caseNote.category.id,
      },
    });
  }

  async setCaseFileTriage(id: uuid, triage: ECaseFileTriage): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/triage`, { triage });
  }
}
