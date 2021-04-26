import { IBeneficiariesService, IBeneficiariesServiceMock } from '@crctech/registration-lib/src/services/beneficiaries';
import { IEventsService, IEventsServiceMock } from '@crctech/registration-lib/src/services/events';

export interface IProvider {
  registrationEvents: IEventsService,
  beneficiaries: IBeneficiariesService,
}

export interface IProviderMock {
  registrationEvents: IEventsServiceMock,
  beneficiaries: IBeneficiariesServiceMock,
}
