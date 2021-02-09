import { httpClient } from '@/services/httpClient';
import { IProvider } from './provider.types';
import { EventsService } from '../events';

export const provider = (): IProvider => ({
  events: new EventsService(httpClient),
});
