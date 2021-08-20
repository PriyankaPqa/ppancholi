import { mockProgramEntities } from '@/entities/program';
import { IProgramsServiceMock } from './programs.types';

export const mockProgramsService = (): IProgramsServiceMock => ({
  createProgram: jest.fn(() => mockProgramEntities()[0]),
  updateProgram: jest.fn(() => mockProgramEntities()[0]),
});
