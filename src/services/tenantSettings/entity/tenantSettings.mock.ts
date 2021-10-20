import { mockBrandingEntity } from '@/entities/branding';
import { mockTenantSettingsEntityData } from '@/entities/tenantSettings';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { ITenantSettingsServiceMock } from './tenantSettings.types';

export const mockProgramsService = (): ITenantSettingsServiceMock => ({
  ...mockDomainBaseService([mockBrandingEntity()]),
  getCurrentTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
  createTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
  createTenantDomains: jest.fn(() => mockTenantSettingsEntityData()),
});
