import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';
import { mockBeneficiariesService } from '../beneficiaries';

export const mockProvider = (): IProviderMock => ({
  registrationEvents: mockEventsService(),
  beneficiaries: mockBeneficiariesService(),
});
