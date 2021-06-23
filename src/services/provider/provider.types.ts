import { IHouseholdsService, IHouseholdsServiceMock } from '../households/entity';
import { IPublicService, IPublicServiceMock } from '../public';

export interface IProvider {
  publicApi: IPublicService;
  households: IHouseholdsService;
}

export interface IProviderMock {
  publicApi: IPublicServiceMock;
  households: IHouseholdsServiceMock;
}
