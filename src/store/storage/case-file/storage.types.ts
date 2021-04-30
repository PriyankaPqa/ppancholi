import { ICaseFile } from '@/entities/case-file';
import { IOptionItem } from '@/entities/optionItem';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';

export interface IStorage {
  getters: {
    caseFileById(id: uuid): ICaseFile;
    tagsOptions(): Array<IOptionItem>;
  }

  actions: {
    fetchTagsOptions(): Promise<IOptionItem[]> ;
    fetchCaseFile(id: uuid): Promise<ICaseFile> ;
    searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFile>>;
    setCaseFileTags(id: uuid, tags: IListOption[]): Promise<ICaseFile>;
  }
}

export interface IStorageMock {
  getters: {
    caseFileById: jest.Mock<void>;
    tagsOptions: jest.Mock<void>;
  }

  actions: {
    fetchTagsOptions: jest.Mock<void>;
    fetchCaseFile: jest.Mock<void>;
    searchCaseFiles: jest.Mock<void>;
    setCaseFileTags: jest.Mock<void>;
  }
}
