import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchResult } from '@/types';
import { IEventData } from '../../entities/event';
import { IEventsService } from './events.types';

export class EventsService implements IEventsService {
  constructor(private readonly http: IHttpClient) {}

  async searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<IEventData>> {
    return this.http.get<IAzureSearchResult<IEventData>>('/public-search/beneficiary-event', {
      params: {
        language: lang,
        registrationLink,
      },
    });
  }
}
