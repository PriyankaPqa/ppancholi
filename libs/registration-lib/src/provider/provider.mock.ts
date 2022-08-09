import { mockPublicService } from '@libs/services-lib/public';
import { mockHouseholdsService } from '@libs/services-lib/households/entity';
import { mockTenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { IProviderMock } from './provider.types';

export const mockProvider = (): IProviderMock => ({
  publicApi: mockPublicService(),
  households: mockHouseholdsService(),
  tenantSettings: mockTenantSettingsService(),
});
