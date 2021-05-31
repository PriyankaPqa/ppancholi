import { IHouseholdsService, IHouseholdsServiceMock } from '@crctech/registration-lib/src/services/households';
import { IPublicService, IPublicServiceMock } from '@crctech/registration-lib/src/services/public';

export interface IProvider {
  publicApi: IPublicService,
  households: IHouseholdsService,
}

export interface IProviderMock {
  publicApi: IPublicServiceMock,
  households: IHouseholdsServiceMock,
}
