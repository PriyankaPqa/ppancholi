import { IProgram, IProgramData } from '@/entities/program';

export interface IProgramsService {
  createProgram(payload: IProgram): Promise<IProgramData>;
}

export interface IProgramsServiceMock {
  createProgram: jest.Mock<IProgramData>;
}
