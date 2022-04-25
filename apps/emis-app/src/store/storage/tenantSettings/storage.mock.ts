import {
  ITenantSettingsCombined,
  ITenantSettingsEntity,
  mockBrandingEntity,
  mockCombinedTenantSettings,
  mockTenantSettingsEntity,
  mockTenantSettingsEntityData,
} from '@/entities/tenantSettings';
import { BaseMock } from '../base/base.mock';

export class TenantSettingsStorageMock extends BaseMock<ITenantSettingsCombined, ITenantSettingsEntity> {
  constructor() {
    super([mockCombinedTenantSettings()], mockTenantSettingsEntity());
  }

  protected getters = {
    ...this.baseGetters,
    currentTenantSettings: jest.fn(() => mockTenantSettingsEntity()),
    isFeatureEnabled: jest.fn(() => true),
    logoUrl: jest.fn(),
  };

  protected actions = {
    ...this.baseActions,
    fetchCurrentTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
    createTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
    createTenantDomains: jest.fn(() => mockTenantSettingsEntityData()),
    enableFeature: jest.fn(() => mockTenantSettingsEntityData()),
    disableFeature: jest.fn(() => mockTenantSettingsEntityData()),
    fetchUserTenants: jest.fn(() => [mockBrandingEntity()]),
    updateColours: jest.fn(() => mockTenantSettingsEntity()),
    updateTenantDetails: jest.fn(() => mockTenantSettingsEntity()),
    updateSupportEmails: jest.fn(() => mockTenantSettingsEntity()),
    fetchLogoUrl: jest.fn(),
  };

  protected mutations = {
    ...this.baseMutations,
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
