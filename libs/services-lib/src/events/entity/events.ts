/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EEventStatus,
  ICreateEventRequest,
  IEditEventRequest,
  IEventAgreement,
  IEventCallCentre,
  IEventEntity,
  IEventExceptionalAuthenticationType,
  IEventGenericLocation,
  IEventLocation,
  IEventSummary,
  IRegistrationAssessment,
} from '@libs/entities-lib/event';
import { IAzureCombinedSearchResult, IAzureSearchParams, IAzureSearchResult } from '@libs/shared-lib/types';
import helpers from '@libs/shared-lib/helpers/helpers';
import { GlobalHandler, IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
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
    return this.http.post(this.baseUrl, payload, { globalHandler: GlobalHandler.Partial });
  }

  async updateEvent(event: IEventEntity): Promise<IEventEntity> {
    event.fillEmptyMultilingualAttributes();
    const payload = this.eventToEditEventRequestPayload(event);
    return this.http.patch(`${this.baseUrl}/${event.id}`, payload, { globalHandler: GlobalHandler.Partial });
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
    return this.http.post(`${this.baseUrl}/${eventId}/call-centres`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async editCallCentre(eventId:uuid, payload: IEventCallCentre): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${eventId}/call-centres/${payload.id}`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async addAgreement(eventId:uuid, payload: IEventAgreement): Promise<IEventEntity> {
    return this.http.post(`${this.baseUrl}/${eventId}/agreement`, this.makeAgreementPayload(payload), { globalHandler: GlobalHandler.Partial });
  }

  async editAgreement(eventId:uuid, payload: IEventAgreement): Promise<IEventEntity> {
    return this.http.patch(
      `${this.baseUrl}/${eventId}/agreement/${payload.id}`,
      this.makeAgreementPayload(payload),
      { globalHandler: GlobalHandler.Partial },
    );
  }

  async editEventConsent(eventId:uuid, consentStatementId: uuid): Promise<IEventEntity> {
    return this.http.patch(
      `${this.baseUrl}/${eventId}/consent-statement`,
      { consentStatementId },
      { globalHandler: GlobalHandler.Partial },
    );
  }

  async removeAgreement(eventId:uuid, agreementId: uuid): Promise<IEventEntity> {
    return this.http.delete(`${this.baseUrl}/${eventId}/agreement/${agreementId}`);
  }

  async updateExceptionalAuthenticationType(eventId:uuid, payload: IEventExceptionalAuthenticationType[]): Promise<IEventEntity> {
    return this.http.patch(
      `${this.baseUrl}/${eventId}/exceptionalAuthenticationTypes`,
      payload,
    );
  }

  async addRegistrationLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity> {
    return this.http.post(`${this.baseUrl}/${eventId}/registration-location`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async editRegistrationLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${eventId}/registration-location/${payload.id}`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async addShelterLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity> {
    return this.http.post(`${this.baseUrl}/${eventId}/shelter-location`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async editShelterLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${eventId}/shelter-location/${payload.id}`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async addRegistrationAssessment(eventId:uuid, payload: IRegistrationAssessment): Promise<IEventEntity> {
    return this.http.post(`${this.baseUrl}/${eventId}/registration-assessment`, payload);
  }

  async editRegistrationAssessment(eventId:uuid, payload: IRegistrationAssessment): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${eventId}/registration-assessment/${payload.id}`, payload);
  }

  async removeRegistrationAssessment(eventId:uuid, registrationId: uuid): Promise<IEventEntity> {
    return this.http.delete(`${this.baseUrl}/${eventId}/registration-assessment/${registrationId}`);
  }

  async search(params: IAzureSearchParams): Promise<IAzureCombinedSearchResult<IEventEntity, null>> {
    return this.http.get(`${this.apiUrlSuffix}/search/eventsV2`, { params, isODataSql: true });
  }

  // events that a user has access to
  async searchMyEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventSummary>> {
    return this.http.get(`${API_URL_SUFFIX}/search/event-summaries`, { params: this.filterForMyEvents(params), isODataSql: true });
  }

  async searchMyEventsById(ids: string[]): Promise<IAzureSearchResult<IEventSummary>> {
    return helpers.callSearchInInBatches({
      searchInFilter: 'Id in({ids})',
      service: this,
      ids,
      api: 'searchMyEvents',
      otherApiParameters: [null, false, true],
    }) as Promise<IAzureSearchResult<IEventSummary>>;
  }

  async toggleAssessmentsForL0Users(id: uuid, assessmentsForL0UsersEnabled: boolean): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/assessments-for-l0-users-enabled`, { assessmentsForL0UsersEnabled });
  }

  async toggleRegistrationForL0Users(id: uuid, registrationsForL0UsersEnabled: boolean): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/registrations-for-l0-users-enabled`, { registrationsForL0UsersEnabled });
  }

  async toggleAppointmentBookingForL0Users(id: uuid, appointmentBookingForL0UsersEnabled: boolean): Promise<IEventEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/appointment-booking-for-l0-users-enabled`, { appointmentBookingForL0UsersEnabled });
  }

  private eventToCreateEventRequestPayload(event: IEventEntity): ICreateEventRequest {
    const payload: ICreateEventRequest = {
      assistanceNumber: event.responseDetails.assistanceNumber,
      consentStatementId: event.consentStatementId,
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
      authenticationTier1disabled: event.authenticationTier1disabled,
      authenticationTier2disabled: event.authenticationTier2disabled,
    };
    return payload;
  }

  private eventToEditEventRequestPayload(event: IEventEntity): IEditEventRequest {
    return {
      ...this.eventToCreateEventRequestPayload(event),
      reOpenReason: event.schedule.updateReason,
      selfRegistrationEnabled: event.selfRegistrationEnabled,
      assessmentsForL0usersEnabled: event.assessmentsForL0usersEnabled,
      registrationsForL0usersEnabled: event.registrationsForL0usersEnabled,
      appointmentBookingForL0usersEnabled: event.appointmentBookingForL0usersEnabled,
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

  private filterForMyEvents(params: IAzureSearchParams, forCombinedEntity = false): IAzureSearchParams {
    const newParams = { ...params };
    const prefix = forCombinedEntity ? 'Entity/' : '';
    newParams.filter = newParams.filter || {};
    if (typeof (newParams.filter) === 'string') {
      newParams.filter = `${newParams.filter} and ${prefix}HasAccess eq true`;
    } else {
      newParams.filter[`${prefix}HasAccess`] = true;
    }
    return newParams;
  }
}
