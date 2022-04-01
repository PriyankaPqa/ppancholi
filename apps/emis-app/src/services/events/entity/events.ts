/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@libs/core-lib/services/http-client';
import { DomainBaseService } from '@/services/base';
import {
  EEventStatus,
  ICreateEventRequest,
  IEditEventRequest,
  IEventAgreement,
  IEventCallCentre,
  IEventEntity,
  IEventGenericLocation,
  IEventLocation,
  IEventMainInfo,
} from '@/entities/event';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IEventsService } from './events.types';

const API_URL_SUFFIX = 'event';
const CONTROLLER = 'events';

export class EventsService extends DomainBaseService<IEventEntity, uuid> implements IEventsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async createEvent(event: IEventEntity): Promise<IEventEntity> {
    event.fillEmptyMultilingualAttributes();
    const payload = this.eventToCreateEventRequestPayload(event);
    return this.http.post(this.baseUrl, payload, { globalHandler: false });
  }

  async updateEvent(event: IEventEntity): Promise<IEventEntity> {
    event.fillEmptyMultilingualAttributes();
    const payload = this.eventToEditEventRequestPayload(event);
    return this.http.patch(`${this.baseUrl}/${event.id}`, payload, { globalHandler: false });
  }

  async toggleSelfRegistration(id: uuid, selfRegistrationEnabled: boolean): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/self-registration-enabled`, { selfRegistrationEnabled });
  }

  async getOtherProvinces(): Promise<IEventLocation[]> {
    return this.http.get(`${this.baseUrl}/other-provinces`);
  }

  async getRegions(): Promise<IEventLocation[]> {
    return this.http.get(`${this.baseUrl}/regions`);
  }

  async setEventStatus(id: uuid, status: EEventStatus, hasBeenOpen?: boolean, reason?: string): Promise<IEventEntity> {
    if (status === EEventStatus.Open) {
      if (hasBeenOpen) {
        return this.http.post(`${this.baseUrl}/${id}/re-open`, {
          reOpenReason: reason,
        });
      }

      return this.http.post(`${this.baseUrl}/${id}/open`, {});
    }

    if (status === EEventStatus.Closed) {
      return this.http.post(`${this.baseUrl}/${id}/close`, {
        closeReason: reason,
      });
    }

    if (status === EEventStatus.OnHold) {
      return this.http.post(`${this.baseUrl}/${id}/place-on-hold`, {});
    }

    if (status === EEventStatus.Archived) {
      return this.http.post(`${this.baseUrl}/${id}/archive`, {});
    }

    throw new Error('Invalid status');
  }

  async addCallCentre(eventId:uuid, payload: IEventCallCentre): Promise<IEventEntity> {
    return this.http.post(`${this.baseUrl}/${eventId}/call-centres`, payload, { globalHandler: false });
  }

  async editCallCentre(eventId:uuid, payload: IEventCallCentre): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${eventId}/call-centres/${payload.id}`, payload, { globalHandler: false });
  }

  async addAgreement(eventId:uuid, payload: IEventAgreement): Promise<IEventEntity> {
    return this.http.post(`${this.baseUrl}/${eventId}/agreement`, this.makeAgreementPayload(payload), { globalHandler: false });
  }

  async editAgreement(eventId:uuid, payload: IEventAgreement): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${eventId}/agreement/${payload.id}`,
      this.makeAgreementPayload(payload), { globalHandler: false });
  }

  async removeAgreement(eventId:uuid, agreementId: uuid): Promise<IEventEntity> {
    return this.http.delete(`${this.baseUrl}/${eventId}/agreement/${agreementId}`);
  }

  async addRegistrationLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity> {
    return this.http.post(`${this.baseUrl}/${eventId}/registration-location`, payload, { globalHandler: false });
  }

  async editRegistrationLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${eventId}/registration-location/${payload.id}`, payload, { globalHandler: false });
  }

  async addShelterLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity> {
    return this.http.post(`${this.baseUrl}/${eventId}/shelter-location`, payload, { globalHandler: false });
  }

  async editShelterLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${eventId}/shelter-location/${payload.id}`, payload, { globalHandler: false });
  }

  // events that a user has access to
  async searchMyEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventMainInfo>> {
    return this.http.get('/search/events-main-information', { params, isOData: true });
  }

  private eventToCreateEventRequestPayload(event: IEventEntity): ICreateEventRequest {
    const payload: ICreateEventRequest = {
      assistanceNumber: event.responseDetails.assistanceNumber,
      dateReported: event.responseDetails.dateReported ? new Date(event.responseDetails.dateReported).toISOString() : null,
      description: event.description,
      name: event.name,
      eventType: {
        optionItemId: event.responseDetails.eventType.optionItemId,
        specifiedOther: event.responseDetails.eventType.specifiedOther || null,
      },
      province: event.location.province,
      provinceOther: event.location.provinceOther,
      region: event.location.region,
      relatedEventIds: event.relatedEventIds,
      responseLevel: event.responseDetails.responseLevel,
      scheduledCloseDate: event.schedule.scheduledCloseDate ? new Date(event.schedule.scheduledCloseDate).toISOString() : null,
      // scheduledCloseDate: null,
      scheduledOpenDate: event.schedule.scheduledOpenDate ? new Date(event.schedule.scheduledOpenDate).toISOString() : null,
      // scheduledOpenDate: null,
      status: event.schedule.status,
    };
    return payload;
  }

  private eventToEditEventRequestPayload(event: IEventEntity): IEditEventRequest {
    return {
      ...this.eventToCreateEventRequestPayload(event),
      reOpenReason: event.schedule.updateReason,
      selfRegistrationEnabled: event.selfRegistrationEnabled,
    };
  }

  private makeAgreementPayload(agreementInfo: IEventAgreement): IEventAgreement {
    return {
      name: agreementInfo.name,
      details: agreementInfo.details,
      startDate: agreementInfo.startDate ? new Date(agreementInfo.startDate).toISOString() : null,
      endDate: agreementInfo.endDate ? new Date(agreementInfo.endDate).toISOString() : null,
      agreementType: {
        ...agreementInfo.agreementType,
        specifiedOther: agreementInfo.agreementType.specifiedOther || null,
      },
    };
  }
}
