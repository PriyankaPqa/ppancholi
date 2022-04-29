import { mockProgramEntities } from '@/entities/program';
import { mockDomainBaseService } from '@libs/core-lib/services/base';
import { IProgramsServiceMock } from './programs.types';

export const mockProgramsService = (): IProgramsServiceMock => ({
  ...mockDomainBaseService([mockProgramEntities()]),
  createProgram: jest.fn(() => mockProgramEntities()[0]),
  updateProgram: jest.fn(() => mockProgramEntities()[0]),
});
