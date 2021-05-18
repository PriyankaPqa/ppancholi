import {
  ICaseFileActivity, ICaseFileData, ICaseFileLabel, ICaseFileSearchData, ECaseFileTriage,
} from '@/entities/case-file';
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

  async setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/tags`, { tags: payload });
  }

  async setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/labels`, { labels });
  }

  async setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/is-duplicate`, { isDuplicate });
  }

  async setCaseFileTriage(id: uuid, triage: ECaseFileTriage): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/triage`, { triage });
  }
}
