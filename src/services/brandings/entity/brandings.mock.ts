import { mockBrandingEntity, mockBrandingEntityData } from '@/entities/branding';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { IBrandingsServiceMock } from './brandings.types';

export const mockProgramsService = (): IBrandingsServiceMock => ({
  ...mockDomainBaseService([mockBrandingEntity()]),
  updateColours: jest.fn(() => mockBrandingEntityData()),
  updateTenantDetails: jest.fn(() => mockBrandingEntityData()),
  getLogoUrl: jest.fn(),
});
