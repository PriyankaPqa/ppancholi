import { ICaseFile } from '@/entities/case-file';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    caseFileById(id:uuid): ICaseFile;
  }

  actions: {
    fetchCaseFile(id: uuid): Promise<ICaseFile> ;
    searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFile>>;
  }
}

export interface IStorageMock {
  getters: {
    caseFileById: jest.Mock<void>;
  }

  actions: {
    fetchCaseFile: jest.Mock<void>;
    searchCaseFiles: jest.Mock<void>;
  }
}
