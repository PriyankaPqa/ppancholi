/* eslint-disable complexity */
import _cloneDeep from 'lodash/cloneDeep';
import { MAX_LENGTH_LG, MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { ECanadaProvinces, IMultilingual } from '@/types';
import utils from '@/entities/utils';

import {
  EEventStatus,
  IEvent,
  IEventCallCentre,
  IEventLocation,
  IEventGenericLocation,
  IEventResponseDetails,
  IEventSchedule,
  IEventSearchData,
  IRelatedEventsInfos,
  IEventAgreementInfos,
  IEventShelterLocation,
} from './event.types';

export class Event implements IEvent {
  id: uuid;

  created: Date | string;

  description: IMultilingual;

  eventStatus: number;

  eventTypeId: uuid;

  eventTypeName: IMultilingual;

  location: IEventLocation;

  name: IMultilingual;

  number: number;

  provinceName: IMultilingual;

  registrationLink: IMultilingual;

  relatedEventsInfos: Array<IRelatedEventsInfos>;

  responseDetails: IEventResponseDetails;

  responseLevelName: IMultilingual;

  schedule: IEventSchedule;

  scheduleHistory: IEventSchedule[];

  scheduleEventStatusName: IMultilingual;

  selfRegistrationEnabled: boolean;

  callCentres: Array<IEventCallCentre>;

  agreements: Array<IEventAgreementInfos>;

  registrationLocations: Array<IEventGenericLocation>;

  shelterLocations: Array<IEventShelterLocation>;

  tenantId: uuid;

  constructor(data?: IEventSearchData) {
    if (data) {
      this.id = data.eventId;

      this.created = new Date(data.createdDate);

      this.name = utils.initMultilingualAttributes(data.eventName);

      this.description = utils.initMultilingualAttributes(data.eventDescription);

      this.eventTypeId = data.eventTypeId;

      this.eventTypeName = data.eventTypeName && data.eventTypeName.translation ? {
        translation: {
          ...data.eventTypeName.translation,
        },
      } : data.eventTypeName;

      this.location = {
        ...data.location,
      };

      this.number = data.number;

      this.provinceName = data.provinceName && data.provinceName.translation ? {
        translation: {
          ...data.provinceName.translation,
        },
      } : null;

      this.registrationLink = utils.initMultilingualAttributes(data.registrationLink);

      this.relatedEventsInfos = data.relatedEventsInfos ? _cloneDeep(data.relatedEventsInfos) : [];

      this.responseDetails = {
        ...data.responseDetails,
        eventType: { ...data.responseDetails.eventType },
        dateReported: data.responseDetails.dateReported ? new Date(data.responseDetails.dateReported) : null,
      };

      this.responseLevelName = data.responseLevelName ? {
        translation: {
          ...data.responseLevelName.translation,
        },
      } : null;

      this.schedule = {
        ...data.schedule,
        closeDate: data.schedule.closeDate ? new Date(data.schedule.closeDate) : null,
        openDate: data.schedule.openDate ? new Date(data.schedule.openDate) : null,
        scheduledCloseDate: data.schedule.scheduledCloseDate ? new Date(data.schedule.scheduledCloseDate) : null,
        scheduledOpenDate: data.schedule.scheduledOpenDate ? new Date(data.schedule.scheduledOpenDate) : null,
        timestamp: data.schedule.timestamp ? new Date(data.schedule.timestamp) : null,
      };

      this.scheduleHistory = data.scheduleHistory.map((s) => ({
        ...s,
        closeDate: s.closeDate ? new Date(s.closeDate) : null,
        openDate: s.openDate ? new Date(s.openDate) : null,
        scheduledCloseDate: s.scheduledCloseDate ? new Date(s.scheduledCloseDate) : null,
        scheduledOpenDate: s.scheduledOpenDate ? new Date(s.scheduledOpenDate) : null,
        timestamp: s.timestamp ? new Date(s.timestamp) : null,
      }));

      this.scheduleEventStatusName = data.scheduleEventStatusName ? {
        translation: {
          ...data.scheduleEventStatusName.translation,
        },
      } : null;

      this.selfRegistrationEnabled = data.selfRegistrationEnabled;
      this.eventStatus = data.eventStatus;
      this.tenantId = data.tenantId;
      this.registrationLocations = data.registrationLocations;
      this.shelterLocations = data.shelterLocations;
      this.callCentres = data.callCentres.map((centre) => ({
        ...centre,
        name: utils.initMultilingualAttributes(centre.name),
        startDate: centre.startDate ? new Date(centre.startDate) : null,
        endDate: centre.endDate ? new Date(centre.endDate) : null,
        details: utils.initMultilingualAttributes(centre.details),
      }));
      this.agreements = data.agreements.map((agreement) => ({
        ...agreement,
        name: utils.initMultilingualAttributes(agreement.name),
        startDate: agreement.startDate ? new Date(agreement.startDate) : null,
        endDate: agreement.endDate ? new Date(agreement.endDate) : null,
        details: utils.initMultilingualAttributes(agreement.details),
        agreementType: { ...agreement.agreementType },
        agreementTypeName: utils.initMultilingualAttributes(agreement.agreementTypeName),
      }));
    } else {
      this.reset();
    }
  }

  get hasBeenOpen(): boolean {
    return this.scheduleHistory.filter((s) => s.status === EEventStatus.Open).length > 0;
  }

  private reset() {
    this.description = utils.initMultilingualAttributes();
    this.eventTypeName = utils.initMultilingualAttributes();
    this.location = {
      province: null,
      provinceOther: utils.initMultilingualAttributes(),
      region: utils.initMultilingualAttributes(),
    };
    this.name = utils.initMultilingualAttributes();
    this.provinceName = utils.initMultilingualAttributes();
    this.registrationLink = utils.initMultilingualAttributes();
    this.relatedEventsInfos = [];
    this.responseDetails = {
      responseLevel: null,
      eventType: {
        optionItemId: '',
        specifiedOther: '',
      },
      dateReported: null,
      assistanceNumber: '',
    };
    this.responseLevelName = utils.initMultilingualAttributes();
    this.schedule = {
      openDate: null,
      closeDate: null,
      scheduledOpenDate: null,
      scheduledCloseDate: null,
      updateReason: '',
      timestamp: null,
      status: EEventStatus.OnHold,
    };
    this.scheduleEventStatusName = utils.initMultilingualAttributes();
    this.callCentres = [];
    this.agreements = [];
    this.registrationLocations = [];
    this.shelterLocations = [];
  }

  private validateAttributes(errors: Array<string>) {
    if (!utils.validateMultilingualFieldRequired(this.name)) {
      errors.push('The name is required');
    }

    if (!utils.validateMultilingualFieldLength(this.name, MAX_LENGTH_MD)) {
      errors.push(`The name field exceeds max length of ${MAX_LENGTH_MD}`);
    }

    if (!utils.validateMultilingualFieldLength(this.description, MAX_LENGTH_LG)) {
      errors.push(`The description field exceeds max length of ${MAX_LENGTH_LG}`);
    }

    if (!utils.validateMultilingualFieldRequired(this.registrationLink)) {
      errors.push('The registrationLink is required');
    }

    if (!utils.validateMultilingualFieldLength(this.registrationLink, MAX_LENGTH_MD)) {
      errors.push(`The registrationLink field exceeds max length of ${MAX_LENGTH_MD}`);
    }
  }

  private validateEventLocation(errors: Array<string>) {
    if (!this.location) {
      errors.push('The location field is required');
    } else {
      if (!this.location.province) {
        errors.push('The location.province field is required');
      }

      if (this.location.province === ECanadaProvinces.OT
      && !utils.validateMultilingualFieldRequired(this.location.provinceOther)) {
        errors.push('The location.provinceOther field is required');
      }

      if (this.location.province === ECanadaProvinces.OT
      && !utils.validateMultilingualFieldLength(this.location.provinceOther, MAX_LENGTH_MD)) {
        errors.push(`The location.provinceOther field exceeds max length of ${MAX_LENGTH_MD}`);
      }

      if (!utils.validateMultilingualFieldLength(this.location.region, MAX_LENGTH_MD)) {
        errors.push(`The location.region field exceeds max length of ${MAX_LENGTH_MD}`);
      }
    }
  }

  private validateEventSchedule(errors: Array<string>) {
    if (!this.schedule) {
      errors.push('The schedule field is required');
    } else if (!this.schedule.status) {
      errors.push('The schedule.status field is required');
    }
  }

  private validateEventResponseDetails(errors: Array<string>) {
    if (!this.responseDetails) {
      errors.push('The responseDetails field is required');
    } else {
      if (!this.responseDetails.responseLevel) {
        errors.push('The responseDetails.responseLevel field is required');
      }

      if (!this.responseDetails.eventType) {
        errors.push('The responseDetails.eventType field is required');
      }

      if (!this.responseDetails.eventType?.optionItemId) {
        errors.push('The responseDetails.eventType.optionItemId field is required');
      }

      if (!this.responseDetails.dateReported) {
        errors.push('The responseDetails.dateReported field is required');
      }

      if (!this.responseDetails.assistanceNumber) {
        errors.push('The responseDetails.assistanceNumber field is required');
      } else if (this.responseDetails.assistanceNumber.length > MAX_LENGTH_SM) {
        errors.push(`The responseDetails.assistanceNumber field exceeds max length of ${MAX_LENGTH_SM}`);
      }
    }
  }

  public fillEmptyMultilingualAttributes() {
    this.name = utils.getFilledMultilingualField(this.name);
    this.description = utils.getFilledMultilingualField(this.description);
    this.location.provinceOther = utils.getFilledMultilingualField(this.location.provinceOther);
    this.location.region = utils.getFilledMultilingualField(this.location.region);
    this.registrationLink = utils.getFilledMultilingualField(this.registrationLink);
  }

  /**
   * Validate business rules (non specific to the application)
   */
  public validate(): Array<string> | boolean {
    const errors: Array<string> = [];

    this.validateAttributes(errors);

    this.validateEventLocation(errors);

    this.validateEventSchedule(errors);

    this.validateEventResponseDetails(errors);

    if (!errors.length) {
      return true;
    }

    return errors;
  }
}
