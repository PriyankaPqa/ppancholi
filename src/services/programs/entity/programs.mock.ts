import { mockProgramEntities } from '@/entities/program';
import { IProgramsServiceMock } from './programs.types';
import { mockDomainBaseService } from '@/services/base/base.mock';

export const mockProgramsService = (): IProgramsServiceMock => ({
  ...mockDomainBaseService([mockProgramEntities()]),
  createProgram: jest.fn(() => mockProgramEntities()[0]),
  updateProgram: jest.fn(() => mockProgramEntities()[0]),
});
