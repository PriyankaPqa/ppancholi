import { httpClient } from '@/services/httpClient';
import { EventsService } from '@crctech/registration-lib/src/services/events';
import { BeneficiariesService } from '@crctech/registration-lib/src/services/beneficiaries';
import { IProvider } from './provider.types';

export const provider = (): IProvider => ({
  registrationEvents: new EventsService(httpClient),
  beneficiaries: new BeneficiariesService(httpClient),
});
