import { IBeneficiariesService, IBeneficiariesServiceMock } from '../beneficiaries';
import { IPublicService, IPublicServiceMock } from '../public';

export interface IProvider {
  publicApi: IPublicService;
  beneficiaries: IBeneficiariesService;
}

export interface IProviderMock {
  publicApi: IPublicServiceMock;
  beneficiaries: IBeneficiariesServiceMock;
}
