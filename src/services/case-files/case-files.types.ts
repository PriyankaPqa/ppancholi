import {
  ICaseFileActivity, ICaseFileData, ICaseFileLabel, ICaseFileSearchData, ICaseNote, ECaseFileTriage, ECaseFileStatus,
} from '@/entities/case-file';
import { IOptionItem } from '@/entities/optionItem';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';

export interface ICaseFilesService {
  searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFileSearchData>>;
  fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]>;
  setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileData>;
  setCaseFileStatus(id: uuid, status: ECaseFileStatus, rationale?: string, reason?: IListOption): Promise<ICaseFileData>;
  setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileData>;
  setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileData>;
  fetchActiveCaseNoteCategories(): Promise<IOptionItem[]>;
  addCaseNote(id: uuid, caseNote: ICaseNote): Promise<ICaseNote[]>;
  setCaseFileTriage(id: uuid, triage: ECaseFileTriage): Promise<ICaseFileData>;
}

export interface ICaseFilesServiceMock {
  searchCaseFiles: jest.Mock<IAzureSearchResult<ICaseFileSearchData>>;
  fetchCaseFileActivities: jest.Mock<ICaseFileActivity[]>;
  setCaseFileTags: jest.Mock<ICaseFileData>;
  setCaseFileStatus: jest.Mock<ICaseFileData>;
  setCaseFileLabels: jest.Mock<ICaseFileData>;
  setCaseFileIsDuplicate: jest.Mock<ICaseFileData>;
  fetchActiveCaseNoteCategories: jest.Mock<IOptionItem[]>;
  addCaseNote: jest.Mock<ICaseNote[]>;
  setCaseFileTriage: jest.Mock<ICaseFileData>;
}
