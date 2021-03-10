import { httpClient } from '@/services/httpClient';
import { IProvider } from './provider.types';
import { EventsService } from '../events';
import { BeneficiariesService } from '../beneficiaries';

export const provider = (): IProvider => ({
  events: new EventsService(httpClient),
  beneficiaries: new BeneficiariesService(httpClient),
});
