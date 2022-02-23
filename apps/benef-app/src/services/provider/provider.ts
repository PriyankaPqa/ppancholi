import { httpClient } from '@/services/httpClient';
import { PublicService } from '@libs/registration-lib/services/public';
import { HouseholdsService } from '@libs/registration-lib/services/households/entity';
import { TenantSettingsService } from '@libs/registration-lib/services/tenantSettings/entity';
import { IProvider } from './provider.types';

export const provider = (): IProvider => ({
  publicApi: new PublicService(httpClient),
  households: new HouseholdsService(httpClient),
  tenantSettings: new TenantSettingsService(httpClient),
});
