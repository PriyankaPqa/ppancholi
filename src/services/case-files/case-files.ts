import { ICaseFileSearchData } from '@/entities/case-file';
import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

import { ICaseFilesService } from './case-files.types';

export class CaseFilesService implements ICaseFilesService {
  constructor(private readonly http: IHttpClient) {}

  async searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFileSearchData>> {
    return this.http.get('/search/case-file-projections', { params, isOData: true });
  }
}
