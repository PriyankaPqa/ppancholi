import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/registration-lib/services/households/entity';
import { IPublicService, IPublicServiceMock } from '@libs/registration-lib/services/public';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '@libs/registration-lib/services/tenantSettings/entity';

export interface IProvider {
  publicApi: IPublicService,
  households: IHouseholdsService,
  tenantSettings: ITenantSettingsService;
}

export interface IProviderMock {
  publicApi: IPublicServiceMock,
  households: IHouseholdsServiceMock,
  tenantSettings: ITenantSettingsServiceMock;
}
