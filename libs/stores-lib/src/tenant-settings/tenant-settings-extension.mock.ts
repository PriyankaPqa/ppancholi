import {
  mockBrandingEntity, mockFeatures,
  mockTenantSettingsEntity,
  mockTenantSettingsEntityData,
} from '@libs/entities-lib/tenantSettings';

export function getMockTenantSettingsExtensionComponents() {
  return {
    currentTenantSettings: mockTenantSettingsEntity(),
    recaptcha: {
      ipAddressIsAllowed: false,
      clientIpAddress: '1.2.3.4',
    },
    isFeatureEnabled: jest.fn(() => true),
    getBranding: jest.fn(() => mockBrandingEntity()),
    setCurrentTenantSettings: jest.fn(() => mockBrandingEntity()),
    setFeatures: jest.fn(),
    setBranding: jest.fn(),
    fetchAllTenantSettings: jest.fn(() => [mockTenantSettingsEntityData()]),
    fetchCurrentTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
    createTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
    createTenantDomains: jest.fn(() => mockTenantSettingsEntityData()),
    createFeature: jest.fn(() => [mockTenantSettingsEntityData()]),
    editFeature: jest.fn(() => mockTenantSettingsEntityData()),
    enableFeature: jest.fn(() => mockTenantSettingsEntityData()),
    disableFeature: jest.fn(() => mockTenantSettingsEntityData()),
    setFeatureEnabled: jest.fn(() => mockTenantSettingsEntityData()),
    setCanEnableFeature: jest.fn(() => mockTenantSettingsEntityData()),
    setCanDisableFeature: jest.fn(() => mockTenantSettingsEntityData()),
    fetchUserTenants: jest.fn(() => [mockBrandingEntity()]),
    updateColours: jest.fn(() => mockTenantSettingsEntity()),
    updateTenantDetails: jest.fn(() => mockTenantSettingsEntity()),
    fetchPublicFeatures: jest.fn(() => mockFeatures()),
    validateCaptchaAllowedIpAddress: jest.fn(),
    fetchBranding: jest.fn(() => mockBrandingEntity()),
    updateTheme: jest.fn(),
    updateSupportEmails: jest.fn(),
  };
}
