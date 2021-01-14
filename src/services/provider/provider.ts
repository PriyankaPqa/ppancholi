import { http } from '@/services/http';
import { IProvider } from './provider.types';
import { EventsService } from '../events';

export const provider = (): IProvider => ({
  events: new EventsService(http),
});
