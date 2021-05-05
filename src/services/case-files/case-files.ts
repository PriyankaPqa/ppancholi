import { ICaseFileData, ICaseFileLabel, ICaseFileSearchData } from '@/entities/case-file';
import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';
import { ICaseFilesService } from './case-files.types';

export class CaseFilesService implements ICaseFilesService {
  constructor(private readonly http: IHttpClient) {}

  async searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFileSearchData>> {
    return this.http.get('/search/case-file-projections', { params, isOData: true });
  }

  async setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/tags`, { tags: payload });
  }

  async setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileData> {
    return this.http.patch(`/case-file/case-files/${id}/labels`, { labels });
  }
}
