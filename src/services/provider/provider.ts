import { httpClient } from '@/services/httpClient';
import { PublicService } from '@crctech/registration-lib/src/services/public';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { TenantSettingsService } from '@crctech/registration-lib/src/services/tenantSettings/entity';
import { IProvider } from './provider.types';

export const provider = (): IProvider => ({
  publicApi: new PublicService(httpClient),
  households: new HouseholdsService(httpClient),
  tenantSettings: new TenantSettingsService(httpClient),
});
