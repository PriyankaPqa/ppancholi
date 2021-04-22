import { mockEventsService } from '@crctech/registration-lib/src/services/events';
import { mockBeneficiariesService } from '@crctech/registration-lib/src/services/beneficiaries';
import { IProviderMock } from './provider.types';

export const mockProvider = (): IProviderMock => ({
  events: mockEventsService(),
  beneficiaries: mockBeneficiariesService(),
});
