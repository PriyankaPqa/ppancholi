import { mockPotentialDuplicateEntity, mockDuplicateHousehold } from '@libs/entities-lib/potential-duplicate';
import { mockDomainBaseService } from '../../base';
import { IPotentialDuplicatesServiceMock } from './potential-duplicates.types';

export const mockPotentialDuplicatesService = (): IPotentialDuplicatesServiceMock => ({
  ...mockDomainBaseService([mockPotentialDuplicateEntity()]),
  getHouseholds: jest.fn(() => [mockDuplicateHousehold()]),
  getDuplicates: jest.fn(() => [mockPotentialDuplicateEntity()]),
  flagNewDuplicate: jest.fn(() => mockPotentialDuplicateEntity()),
  flagDuplicate: jest.fn(() => mockPotentialDuplicateEntity()),
  resolveDuplicate: jest.fn(() => mockPotentialDuplicateEntity()),
});
