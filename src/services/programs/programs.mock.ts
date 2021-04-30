import { mockProgramsData, mockSearchPrograms } from '@/entities/program';
import { IProgramsServiceMock } from './programs.types';

export const mockProgramsService = (): IProgramsServiceMock => ({
  createProgram: jest.fn(() => mockProgramsData()[0]),
  updateProgram: jest.fn(() => mockProgramsData()[0]),
  searchPrograms: jest.fn(() => mockSearchPrograms()),
});
