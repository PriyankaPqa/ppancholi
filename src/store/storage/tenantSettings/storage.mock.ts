import {
  ITenantSettingsCombined, ITenantSettingsEntity, mockCombinedTenantSettings, mockTenantSettingsEntity, mockTenantSettingsEntityData,
} from '@/entities/tenantSettings';
import { BaseMock } from '../base/base.mock';

export class TenantSettingsStorageMock extends BaseMock<ITenantSettingsCombined, ITenantSettingsEntity> {
  constructor() {
    super([mockCombinedTenantSettings()], mockTenantSettingsEntity());
  }

  protected getters = {
    ...this.baseGetters,
    currentTenantSettings: jest.fn(() => mockTenantSettingsEntity()),
  };

  protected actions = {
    ...this.baseActions,
    getCurrentTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
    createTenantSettings: jest.fn(() => mockTenantSettingsEntityData()),
    createTenantDomains: jest.fn(() => mockTenantSettingsEntityData()),
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
