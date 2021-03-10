import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';
import { mockBeneficiariesService } from '../beneficiaries';

export const mockProvider = (): IProviderMock => ({
  events: mockEventsService(),
  beneficiaries: mockBeneficiariesService(),
});
