import {
  ICaseFileActivity, ICaseFileData, ICaseFileLabel, ICaseFileSearchData, ECaseFileTriage, ECaseFileStatus,
} from '@/entities/case-file';
import { ICaseNote, ICaseNoteData, ICaseNoteSearchData } from '@/entities/case-file/case-note';
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
  addCaseNote(id: uuid, caseNote: ICaseNote): Promise<ICaseNoteData>;
  pinCaseNote(id: uuid, caseNoteId: uuid, isPinned: boolean): Promise<ICaseNoteData>;
  editCaseNote(id: uuid, caseNoteId: uuid, caseNote: ICaseNote): Promise<ICaseNoteData>;
  searchCaseNotes(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseNoteSearchData>>;
  setCaseFileTriage(id: uuid, triage: ECaseFileTriage): Promise<ICaseFileData>;
  setCaseFileAssign(id: uuid, individuals: uuid[], teams: uuid[]): Promise<ICaseFileData>;
}

export interface ICaseFilesServiceMock {
  searchCaseFiles: jest.Mock<IAzureSearchResult<ICaseFileSearchData>>;
  fetchCaseFileActivities: jest.Mock<ICaseFileActivity[]>;
  setCaseFileTags: jest.Mock<ICaseFileData>;
  setCaseFileStatus: jest.Mock<ICaseFileData>;
  setCaseFileLabels: jest.Mock<ICaseFileData>;
  setCaseFileIsDuplicate: jest.Mock<ICaseFileData>;
  fetchActiveCaseNoteCategories: jest.Mock<IOptionItem[]>;
  addCaseNote: jest.Mock<ICaseNoteData>;
  pinCaseNote: jest.Mock<ICaseNoteData>;
  editCaseNote: jest.Mock<ICaseNoteData>;
  searchCaseNotes: jest.Mock<IAzureSearchResult<ICaseNoteSearchData>>;
  setCaseFileTriage: jest.Mock<ICaseFileData>;
  setCaseFileAssign: jest.Mock<ICaseFileData>;
}
