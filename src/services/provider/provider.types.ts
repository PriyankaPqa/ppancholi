import { IBeneficiariesService, IBeneficiariesServiceMock } from '../beneficiaries';
import { IEventsService, IEventsServiceMock } from '../events';

export interface IProvider {
  events: IEventsService,
  beneficiaries: IBeneficiariesService,
}

export interface IProviderMock {
  events: IEventsServiceMock,
  beneficiaries: IBeneficiariesServiceMock,
}
