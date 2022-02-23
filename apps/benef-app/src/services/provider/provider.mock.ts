import { mockPublicService } from '@libs/registration-lib/services/public';
import { mockHouseholdsService } from '@libs/registration-lib/services/households/entity';
import { mockTenantSettingsService } from '@libs/registration-lib/services/tenantSettings/entity';
import { IProviderMock } from './provider.types';

export const mockProvider = (): IProviderMock => ({
  publicApi: mockPublicService(),
  households: mockHouseholdsService(),
  tenantSettings: mockTenantSettingsService(),
});
