import { ICaseFile } from '@/entities/case-file';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
  }

  actions: {
    searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFile>>;
  }
}

export interface IStorageMock {
  getters: {
  }

  actions: {
    searchCaseFiles: jest.Mock<void>;
  }
}
