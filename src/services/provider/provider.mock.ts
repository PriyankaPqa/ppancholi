import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';
import { mockEventTypesService } from '../eventTypes';
import { mockTeamsService } from '../teams';

export const mockProvider = (): IProviderMock => ({
  events: mockEventsService(),
  eventTypes: mockEventTypesService(),
  teams: mockTeamsService(),
});
