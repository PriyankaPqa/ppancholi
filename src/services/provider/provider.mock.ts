import { IProviderMock } from './provider.types';
import { mockPublicService } from '../public';
import { mockHouseholdsService } from '../households/entity';
import { mockTenantSettingsService } from '../tenantSettings/entity';

export const mockProvider = (): IProviderMock => ({
  publicApi: mockPublicService(),
  households: mockHouseholdsService(),
  tenantSettings: mockTenantSettingsService(),
});
