import { mockPublicService } from '@crctech/registration-lib/src/services/public';
import { mockHouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { mockTenantSettingsService } from '@crctech/registration-lib/src/services/tenantSettings/entity';
import { IProviderMock } from './provider.types';

export const mockProvider = (): IProviderMock => ({
  publicApi: mockPublicService(),
  households: mockHouseholdsService(),
  tenantSettings: mockTenantSettingsService(),
});
