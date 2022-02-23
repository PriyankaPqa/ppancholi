import { IHouseholdsService, IHouseholdsServiceMock } from '@crctech/registration-lib/src/services/households/entity';
import { IPublicService, IPublicServiceMock } from '@crctech/registration-lib/src/services/public';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '@crctech/registration-lib/src/services/tenantSettings/entity';

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
