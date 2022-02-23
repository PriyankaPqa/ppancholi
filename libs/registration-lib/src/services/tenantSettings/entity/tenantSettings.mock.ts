import {
  mockBrandingEntityData, mockFeatures, mockTenantSettingsEntity, mockTenantSettingsEntityData,
} from '../../../entities/tenantSettings';
import { mockDomainBaseService } from '../../base/base.mock';
import { ITenantSettingsServiceMock } from './tenantSettings.types';

export const mockTenantSettingsService = (): ITenantSettingsServiceMock => ({
  ...mockDomainBaseService([mockTenantSettingsEntity()]),
  getCurrentTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
  getPublicFeatures: jest.fn(() => mockFeatures()),
  getBranding: jest.fn(() => mockBrandingEntityData()),
  createTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
  createTenantDomains: jest.fn(() => mockTenantSettingsEntityData()),
  enableFeature: jest.fn(() => mockTenantSettingsEntityData()),
  disableFeature: jest.fn(() => mockTenantSettingsEntityData()),
  getUserTenants: jest.fn(() => [mockBrandingEntityData()]),
  updateColours: jest.fn(() => mockTenantSettingsEntityData()),
  updateTenantDetails: jest.fn(() => mockTenantSettingsEntityData()),
  getLogoUrl: jest.fn(),
  validateCaptchaAllowedIpAddress: jest.fn(),
});
