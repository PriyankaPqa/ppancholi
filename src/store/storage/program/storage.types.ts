import { IProgram } from '@/entities/program';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  actions: {
    createProgram(program: IProgram): Promise<IProgram>;
    searchPrograms(params: IAzureSearchParams): Promise<IAzureSearchResult<IProgram>>;
  }
}

export interface IStorageMock {
  actions: {
    createProgram: jest.Mock<void>;
    searchPrograms: jest.Mock<void>;
  },
}
