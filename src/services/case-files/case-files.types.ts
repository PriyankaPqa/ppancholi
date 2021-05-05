import { ICaseFileData, ICaseFileLabel, ICaseFileSearchData } from '@/entities/case-file';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';

export interface ICaseFilesService {
  searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFileSearchData>>;
  setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileData>;
  setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileData>;
  setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileData>;
}

export interface ICaseFilesServiceMock {
  searchCaseFiles: jest.Mock<IAzureSearchResult<ICaseFileSearchData>>;
  setCaseFileTags: jest.Mock<ICaseFileData>;
  setCaseFileLabels: jest.Mock<ICaseFileData>;
  setCaseFileIsDuplicate: jest.Mock<ICaseFileData>;
}
