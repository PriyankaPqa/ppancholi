import { mockPublicService } from '@crctech/registration-lib/src/services/public';
import { mockBeneficiariesService } from '@crctech/registration-lib/src/services/beneficiaries';
import { IProviderMock } from './provider.types';

export const mockProvider = (): IProviderMock => ({
  publicApi: mockPublicService(),
  beneficiaries: mockBeneficiariesService(),
});
