import { IProviderMock } from './provider.types';
import { mockPublicService } from '../public';
import { mockBeneficiariesService } from '../beneficiaries';

export const mockProvider = (): IProviderMock => ({
  publicApi: mockPublicService(),
  beneficiaries: mockBeneficiariesService(),
});
