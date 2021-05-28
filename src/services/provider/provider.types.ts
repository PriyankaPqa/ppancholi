import { IHouseholdsService, IHouseholdsServiceMock } from '../households';
import { IPublicService, IPublicServiceMock } from '../public';

export interface IProvider {
  publicApi: IPublicService;
  households: IHouseholdsService;
}

export interface IProviderMock {
  publicApi: IPublicServiceMock;
  households: IHouseholdsServiceMock;
}
