import { PublicService } from '@libs/services-lib/public';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { httpClient } from '@/services/httpClient';
import { IProvider } from './provider.types';

export const provider = (): IProvider => ({
  publicApi: new PublicService(httpClient),
  households: new HouseholdsService(httpClient),
  tenantSettings: new TenantSettingsService(httpClient),
});
