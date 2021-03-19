import { IHttpClient } from '@/services/httpClient';
import {
  ICreateEventRequest, IEditEventRequest, IEvent, IEventData, IOtherProvince, IRegion,
} from '@/entities/event';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IEventsService } from './events.types';

export class EventsService implements IEventsService {
  constructor(private readonly http: IHttpClient) {}

  async createEvent(event: IEvent): Promise<IEventData> {
    event.fillEmptyMultilingualAttributes();
    const payload = this.eventToCreateEventRequestPayload(event);
    return this.http.post('/event/events', payload, { globalHandler: false });
  }

  async updateEvent(event: IEvent): Promise<IEventData> {
    event.fillEmptyMultilingualAttributes();
    const payload = this.eventToEditEventRequestPayload(event);
    return this.http.patch(`/event/events/${event.id}/edit`, payload, { globalHandler: false });
  }

  async getEventById(id: uuid): Promise<IEventData> {
    return this.http.get(`/event/events/${id}`);
  }

  async getEvents(): Promise<IEventData[]> {
    return this.http.get('/event/events');
  }

  async getOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>> {
    return this.http.get('/search/event-province-others');
  }

  async getRegions(): Promise<IAzureSearchResult<IRegion>> {
    return this.http.get('/search/event-regions');
  }

  async searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventData>> {
    return this.http.get('/search/events', { params, isOData: true });
  }

  private eventToCreateEventRequestPayload(event: IEvent): ICreateEventRequest {
    const payload: ICreateEventRequest = {
      assistanceNumber: event.responseDetails.assistanceNumber,
      dateReported: event.responseDetails.dateReported ? new Date(event.responseDetails.dateReported).toISOString() : null,
      description: event.description,
      name: event.name,
      eventType: {
        optionItemId: event.responseDetails.eventType.optionItemId,
        specifiedOther: event.responseDetails.eventType.specifiedOther,
      },
      province: event.location.province,
      provinceOther: event.location.provinceOther,
      region: event.location.region,
      relatedEventIds: event.relatedEventIds,
      responseLevel: event.responseDetails.responseLevel,
      scheduledCloseDate: event.schedule.scheduledCloseDate ? new Date(event.schedule.scheduledCloseDate).toISOString() : null,
      scheduledOpenDate: event.schedule.scheduledOpenDate ? new Date(event.schedule.scheduledOpenDate).toISOString() : null,
      status: event.schedule.status,
    };

    return payload;
  }

  private eventToEditEventRequestPayload(event: IEvent): IEditEventRequest {
    return {
      ...this.eventToCreateEventRequestPayload(event),
      reOpenReason: event.schedule.reOpenReason,
    };
  }
}
