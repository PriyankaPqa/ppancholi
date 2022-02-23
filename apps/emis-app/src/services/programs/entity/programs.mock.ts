import { mockProgramEntities } from '@/entities/program';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { IProgramsServiceMock } from './programs.types';

export const mockProgramsService = (): IProgramsServiceMock => ({
  ...mockDomainBaseService([mockProgramEntities()]),
  createProgram: jest.fn(() => mockProgramEntities()[0]),
  updateProgram: jest.fn(() => mockProgramEntities()[0]),
});
