import { IHttpClient } from '@/services/httpClient';
import { IEventTypeData } from '@/entities/eventType';
import { ICreateEventRequest, IEvent, IEventData } from '@/entities/event';
import { IEventsService } from './events.types';

export class EventsService implements IEventsService {
  constructor(private readonly http: IHttpClient) {}

  async createEvent(event: IEvent): Promise<IEventData> {
    const payload = this.eventToCreateEventRequestPayload(event);
    return this.http.post('/event/events', payload);
  }

  async getEvents(): Promise<IEventData[]> {
    return this.http.get('/event/events');
  }

  async getEventTypes(): Promise<IEventTypeData[]> {
    return this.http.get('/event/event-types');
  }

  private eventToCreateEventRequestPayload(event: IEvent): ICreateEventRequest {
    const payload: ICreateEventRequest = {
      assistanceNumber: event.responseDetails.assistanceNumber,
      dateReported: event.responseDetails.dateReported,
      description: event.description,
      name: event.name,
      province: event.location.province,
      provinceOther: event.location.provinceOther,
      region: event.location.region,
      relatedEvents: event.relatedEvents,
      responseLevel: event.responseDetails.responseLevel,
      scheduledCloseDate: event.schedule.scheduledCloseDate,
      scheduledOpenDate: event.schedule.scheduledOpenDate,
    };

    return payload;
  }
}
