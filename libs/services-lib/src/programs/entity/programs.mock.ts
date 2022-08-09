import { mockProgramEntities } from '@libs/entities-lib/program';
import { mockDomainBaseService } from '../../base';
import { IProgramsServiceMock } from './programs.types';

export const mockProgramsService = (): IProgramsServiceMock => ({
  ...mockDomainBaseService([mockProgramEntities()]),
  createProgram: jest.fn(() => mockProgramEntities()[0]),
  updateProgram: jest.fn(() => mockProgramEntities()[0]),
});
