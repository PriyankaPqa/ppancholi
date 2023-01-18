import { mockMassActionEntity } from '@libs/entities-lib/mass-action';

export function getMockExtensionComponents() {
  return {
    process: jest.fn(() => mockMassActionEntity()),
    update: jest.fn(() => mockMassActionEntity()),
    create: jest.fn(() => mockMassActionEntity()),
  };
}
