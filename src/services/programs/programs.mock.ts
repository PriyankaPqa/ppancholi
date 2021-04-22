import { mockProgramsData } from '@/entities/program';
import { IProgramsServiceMock } from './programs.types';

export const mockProgramsService = (): IProgramsServiceMock => ({
  createProgram: jest.fn(() => mockProgramsData()[0]),
});
