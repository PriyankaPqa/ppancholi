import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';

export const mockProvider = (): IProviderMock => ({
  events: mockEventsService(),
});
