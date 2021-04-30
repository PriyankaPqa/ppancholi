import { ICaseFileData, ICaseFileSearchData } from '@/entities/case-file';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';

export interface ICaseFilesService {
  searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFileSearchData>>;
  setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileData>;
}

export interface ICaseFilesServiceMock {
  searchCaseFiles: jest.Mock<IAzureSearchResult<ICaseFileSearchData>>;
  setCaseFileTags: jest.Mock<ICaseFileData>;
}
