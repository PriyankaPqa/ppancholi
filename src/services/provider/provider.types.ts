import { IHouseholdsService, IHouseholdsServiceMock } from '../households/entity';
import { IPublicService, IPublicServiceMock } from '../public';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '../tenantSettings/entity/tenantSettings.types';

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
