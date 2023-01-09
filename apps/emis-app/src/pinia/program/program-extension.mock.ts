import { mockProgramEntity } from '@libs/entities-lib/program';

export function getMockExtensionComponents() {
  return {
    createProgram: jest.fn(() => Promise.resolve(mockProgramEntity())),
    updateProgram: jest.fn(() => Promise.resolve(mockProgramEntity())),
  };
}
