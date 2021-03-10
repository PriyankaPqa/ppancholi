import { IHttpClient } from '@/services/httpClient';
import { IEventData } from '@/entities/event';
import { IEventsService } from './events.types';

export class EventsService implements IEventsService {
  constructor(private readonly http: IHttpClient) {}

  async searchEvents(lang: string, registrationLink: string): Promise<IEventData[]> {
    return this.http.get<IEventData[]>('/public-search/beneficiary-event', {
      params: {
        language: lang,
        registrationLink,
      },
    });
  }
}
