import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';
import { mockEventTypesService } from '../eventTypes';
import { mockTeamsService } from '../teams';
import { mockAppUsersService } from '../app-users';

export const mockProvider = (): IProviderMock => ({
  events: mockEventsService(),
  eventTypes: mockEventTypesService(),
  teams: mockTeamsService(),
  appUsers: mockAppUsersService(),
});
