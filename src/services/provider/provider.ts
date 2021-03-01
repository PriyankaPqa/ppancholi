import { httpClient } from '@/services/httpClient';
import { IProvider } from './provider.types';
import { EventsService } from '../events';
import { OptionItemsService } from '../optionItems';
import { TeamsService } from '../teams';
import { AppUsersService } from '../app-users';

export const provider = (): IProvider => ({
  appUsers: new AppUsersService(httpClient),
  events: new EventsService(httpClient),
  optionItems: new OptionItemsService(httpClient),
  teams: new TeamsService(httpClient),
});
