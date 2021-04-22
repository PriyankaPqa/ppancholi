import { IProgram } from '@/entities/program';

export interface IStorage {
  actions: {
    createProgram(program: IProgram): Promise<IProgram>;
  }
}

export interface IStorageMock {
  actions: {
    createProgram: jest.Mock<void>;
  },
}
