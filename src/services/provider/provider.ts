import { httpClient } from '@/services/httpClient';
import { PublicService } from '@crctech/registration-lib/src/services/public';
import { BeneficiariesService } from '@crctech/registration-lib/src/services/beneficiaries';
import { IProvider } from './provider.types';

export const provider = (): IProvider => ({
  publicApi: new PublicService(httpClient),
  beneficiaries: new BeneficiariesService(httpClient),
});
