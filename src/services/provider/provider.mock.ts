import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';
import { mockTeamsService } from '../teams';

export const mockProvider = (): IProviderMock => ({
  events: mockEventsService(),
  teams: mockTeamsService(),
});
