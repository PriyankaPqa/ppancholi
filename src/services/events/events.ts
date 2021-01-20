import { IHttpClient } from '@/services/httpClient';
import { IEventTypeData } from '@/entities/eventType';
import { ICreateEventRequest, IEvent, IEventData } from '@/entities/event';
import { IRestResponse } from '@/types';
import { IEventsService } from './events.types';

export class EventsService implements IEventsService {
  constructor(private readonly http: IHttpClient) {}

  async createEvent(event: IEvent): Promise<IRestResponse<IEventData>> {
    // const payload: ICreateEventRequest = {

    // }; todo

    return this.http.post('/event/events', null);
  }

  async getEvents(): Promise<IRestResponse<IEventData[]>> {
    return this.http.get('/event/events');
  }

  async getEventTypes(): Promise<IRestResponse<IEventTypeData[]>> {
    return this.http.get('/event/event-types');
  }
}
