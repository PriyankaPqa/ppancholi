import { httpClient } from '@/services/httpClient';
import { IProvider } from './provider.types';
import { EventsService } from '../events';
import { EventTypesService } from '../eventTypes';
import { TeamsService } from '../teams';
import { AppUsersService } from '../app-users';

export const provider = (): IProvider => ({
  events: new EventsService(httpClient),
  eventTypes: new EventTypesService(httpClient),
  teams: new TeamsService(httpClient),
  appUsers: new AppUsersService(httpClient),
});
