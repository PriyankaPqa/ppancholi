import { IBeneficiariesService, IBeneficiariesServiceMock } from '../beneficiaries';
import { IEventsService, IEventsServiceMock } from '../events';

export interface IProvider {
  registrationEvents: IEventsService;
  beneficiaries: IBeneficiariesService;
}

export interface IProviderMock {
  registrationEvents: IEventsServiceMock;
  beneficiaries: IBeneficiariesServiceMock;
}
