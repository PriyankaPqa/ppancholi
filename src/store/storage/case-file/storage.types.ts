import {
  ICaseFile, ICaseFileActivity, ICaseFileLabel, ECaseFileStatus, ECaseFileTriage,
} from '@/entities/case-file';
import { IOptionItem, IOptionItemData } from '@/entities/optionItem';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';

export interface IStorage {
  getters: {
    caseFileById(id: uuid): ICaseFile;
    tagsOptions(): Array<IOptionItem>;
    inactiveReasons(): Array<IOptionItem>;
    closeReasons(): Array<IOptionItem>;
  };

  actions: {
    fetchTagsOptions(): Promise<IOptionItem[]>;
    fetchInactiveReasons(): Promise<IOptionItem[]>;
    fetchCloseReasons(): Promise<IOptionItem[]>;
    fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity>;
    fetchCaseFile(id: uuid): Promise<ICaseFile>;
    searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFile>>;
    setCaseFileTags(id: uuid, tags: IListOption[]): Promise<ICaseFile>;
    setCaseFileStatus(id: uuid, status: ECaseFileStatus, rationale?: string, reason?: IListOption): Promise<ICaseFile>;
    setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFile>;
    setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFile>;
    setCaseFileTriage(id: uuid, triage: ECaseFileTriage): Promise<ICaseFile>;
  };
}

export interface IStorageMock {
  getters: {
    caseFileById: jest.Mock<void>;
    tagsOptions: jest.Mock<void>;
    inactiveReasons: jest.Mock<void>;
    closeReasons: jest.Mock<void>;
  };

  actions: {
    fetchTagsOptions: jest.Mock<void>;
    fetchInactiveReasons: jest.Mock<IOptionItemData[]>;
    fetchCloseReasons: jest.Mock<IOptionItemData[]>;
    fetchCaseFile: jest.Mock<ICaseFile>;
    fetchCaseFileActivities: jest.Mock<ICaseFileActivity[]>;
    searchCaseFiles: jest.Mock<void>;
    setCaseFileTags: jest.Mock<void>;
    setCaseFileStatus: jest.Mock<void>;
    setCaseFileLabels: jest.Mock<void>;
    setCaseFileIsDuplicate: jest.Mock<void>;
    setCaseFileTriage: jest.Mock<ICaseFile>;
  };
}
