import { httpClient } from '@/services/httpClient';
import { IProvider } from './provider.types';
import { EventsService } from '../events';
import { TeamsService } from '../teams';

export const provider = (): IProvider => ({
  events: new EventsService(httpClient),
  teams: new TeamsService(httpClient),
});
