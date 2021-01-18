import { IHttpClient } from '@/services/httpClient';
import { IEventTypeData } from '@/entities/eventType';
import { IRestResponse } from '@/types';
import { IEventsService } from './events.types';

export class EventsService implements IEventsService {
  constructor(private readonly http: IHttpClient) {}

  async getEventTypes(): Promise<IRestResponse<IEventTypeData[]>> {
    return this.http.get('/event/event-types');
  }
}
