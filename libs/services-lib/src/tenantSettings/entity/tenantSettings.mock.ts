import {
  mockBrandingEntityData, mockFeatures, mockTenantSettingsEntity, mockTenantSettingsEntityData, mockConsentStatements,
} from '@libs/entities-lib/tenantSettings';
import { mockDomainBaseService } from '../../base';
import { ITenantSettingsServiceMock } from './tenantSettings.types';

export const mockTenantSettingsService = (): ITenantSettingsServiceMock => ({
  ...mockDomainBaseService([mockTenantSettingsEntity()]),
  getAllTenants: jest.fn(() => [mockTenantSettingsEntityData()]),
  getCurrentTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
  createTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
  createTenantDomains: jest.fn(() => mockTenantSettingsEntityData()),
  createFeature: jest.fn(() => [mockTenantSettingsEntityData()]),
  removeFeature: jest.fn(() => [mockTenantSettingsEntityData()]),
  editFeature: jest.fn(() => mockTenantSettingsEntityData()),
  enableFeature: jest.fn(() => mockTenantSettingsEntityData()),
  disableFeature: jest.fn(() => mockTenantSettingsEntityData()),
  setFeatureEnabled: jest.fn(() => [mockTenantSettingsEntityData()]),
  canEnableFeature: jest.fn(() => [mockTenantSettingsEntityData()]),
  canDisableFeature: jest.fn(() => [mockTenantSettingsEntityData()]),
  getUserTenants: jest.fn(() => [mockBrandingEntityData()]),
  updateColours: jest.fn(() => mockTenantSettingsEntityData()),
  updateTenantDetails: jest.fn(() => mockTenantSettingsEntityData()),
  updateSupportEmails: jest.fn(() => mockTenantSettingsEntityData()),
  getLogoUrl: jest.fn(() => 'some url'),
  getPublicFeatures: jest.fn(() => mockFeatures()),
  getBranding: jest.fn(() => mockBrandingEntityData()),
  validateCaptchaAllowedIpAddress: jest.fn(),
  getConsentStatement: jest.fn(() => mockConsentStatements()[0]),
});
