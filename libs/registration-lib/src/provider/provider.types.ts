import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/services-lib/households/entity';
import { IPublicService, IPublicServiceMock } from '@libs/services-lib/public';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '@libs/services-lib/tenantSettings/entity';

export interface IProvider {
  publicApi: IPublicService;
  households: IHouseholdsService;
  tenantSettings: ITenantSettingsService;
}

export interface IProviderMock {
  publicApi: IPublicServiceMock;
  households: IHouseholdsServiceMock;
  tenantSettings: ITenantSettingsServiceMock;
}
