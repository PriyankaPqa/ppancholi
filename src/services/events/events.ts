import { ISearchData } from '@/types';
import { IHttpClient } from '@/services/httpClient';
import { IEventData } from '@/entities/event';
import { IEventsService } from './events.types';

export class EventsService implements IEventsService {
  constructor(private readonly http: IHttpClient) {}

  async searchEvents(params: ISearchData): Promise<IEventData[]> {
    return this.http.get<IEventData[]>('/public-search/beneficiary-event', { params, isOData: true });
  }
}
