import {
  ECaseFileTriage, ICaseFileActivity, ICaseFileData, ICaseFileLabel, ICaseFileSearchData,
} from '@/entities/case-file';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';

export interface ICaseFilesService {
  searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFileSearchData>>;
  fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]>;
  setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileData>;
  setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileData>;
  setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileData>;
  setCaseFileTriage(id: uuid, triage: ECaseFileTriage): Promise<ICaseFileData>;
}

export interface ICaseFilesServiceMock {
  searchCaseFiles: jest.Mock<IAzureSearchResult<ICaseFileSearchData>>;
  fetchCaseFileActivities: jest.Mock<ICaseFileActivity[]>;
  setCaseFileTags: jest.Mock<ICaseFileData>;
  setCaseFileLabels: jest.Mock<ICaseFileData>;
  setCaseFileIsDuplicate: jest.Mock<ICaseFileData>;
  setCaseFileTriage: jest.Mock<ICaseFileData>;
}
