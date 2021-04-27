import { IProgram } from '@/entities/program';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    getProgramById(id: uuid): IProgram;
  },

  actions: {
    createProgram(program: IProgram): Promise<IProgram>;
    searchPrograms(params: IAzureSearchParams): Promise<IAzureSearchResult<IProgram>>;
    fetchProgram(id: uuid): Promise<IProgram>;
  }
}

export interface IStorageMock {
  getters: {
    getProgramById: jest.Mock<void>;
  },

  actions: {
    createProgram: jest.Mock<void>;
    searchPrograms: jest.Mock<void>;
    fetchProgram: jest.Mock<void>;
  },
}
