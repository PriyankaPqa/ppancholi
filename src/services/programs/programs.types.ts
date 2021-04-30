import { IProgram, IProgramData, IProgramSearchData } from '@/entities/program';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IProgramsService {
  createProgram(payload: IProgram): Promise<IProgramData>;
  updateProgram(payload: IProgram): Promise<IProgramData>;
  searchPrograms(params: IAzureSearchParams): Promise<IAzureSearchResult<IProgramSearchData>>;
}

export interface IProgramsServiceMock {
  createProgram: jest.Mock<IProgramData>;
  updateProgram: jest.Mock<IProgramData>;
  searchPrograms: jest.Mock<IAzureSearchResult<IProgramSearchData>>;
}
