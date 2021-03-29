import { IHttpClient } from '@/services/httpClient';
import {
  ICreateEventRequest, IEditEventRequest, IEvent, IEventCallCentre, IEventData, IEventSearchData, IOtherProvince, IRegion, IUpdateCallCentrePayload,
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

  async toggleSelfRegistration(id: uuid, selfRegistrationEnabled: boolean): Promise<IEventData> {
    return this.http.patch(`/event/events/${id}/self-registration-enabled`, { selfRegistrationEnabled });
  }

  async getOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>> {
    return this.http.get('/search/event-province-others');
  }

  async getRegions(): Promise<IAzureSearchResult<IRegion>> {
    return this.http.get('/search/event-regions');
  }

  async searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventSearchData>> {
    return this.http.get('/search/event-projections', { params, isOData: true });
  }

  async addCallCentre(eventId:uuid, payload: IEventCallCentre): Promise<IEventData> {
    return this.http.post(`/event/events/${eventId}/call-centres`, payload);
  }

  async editCallCentre(eventId:uuid, payload: IUpdateCallCentrePayload): Promise<IEventData> {
    return this.http.post(`/event/events/${eventId}/call-centres/edit`, payload);
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
      relatedEventIds: event.relatedEventsInfos.map((el) => el.id),
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
      selfRegistrationEnabled: event.selfRegistrationEnabled,
    };
  }
}
