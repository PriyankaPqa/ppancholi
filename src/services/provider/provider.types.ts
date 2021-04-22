import { IBeneficiariesService, IBeneficiariesServiceMock } from '@crctech/registration-lib/src/services/beneficiaries';
import { IEventsService, IEventsServiceMock } from '@crctech/registration-lib/src/services/events';

export interface IProvider {
  events: IEventsService,
  beneficiaries: IBeneficiariesService,
}

export interface IProviderMock {
  events: IEventsServiceMock,
  beneficiaries: IBeneficiariesServiceMock,
}
