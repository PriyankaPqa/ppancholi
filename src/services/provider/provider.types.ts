import { IBeneficiariesService, IBeneficiariesServiceMock } from '@crctech/registration-lib/src/services/beneficiaries';
import { IPublicService, IPublicServiceMock } from '@crctech/registration-lib/src/services/public';

export interface IProvider {
  publicApi: IPublicService,
  beneficiaries: IBeneficiariesService,
}

export interface IProviderMock {
  publicApi: IPublicServiceMock,
  beneficiaries: IBeneficiariesServiceMock,
}
