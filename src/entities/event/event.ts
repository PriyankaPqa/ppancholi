import { MAX_LENGTH_LG, MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { ECanadaProvinces, IMultilingual } from '@/types';
import utils from '@/entities/utils';

import {
  EEventStatus,
  IEvent,
  IEventData,
  IEventLocation,
  IEventResponseDetails,
  IEventSchedule,
} from './event.types';

export class Event implements IEvent {
  id: string;

  created: Date | string;

  timestamp: Date | string;

  eTag: string;

  number: number;

  name: IMultilingual;

  description: IMultilingual;

  registrationLink: IMultilingual;

  location: IEventLocation;

  schedule: IEventSchedule;

  responseDetails: IEventResponseDetails;

  relatedEvents: Array<uuid>;

  constructor(data?: IEventData) {
    if (data) {
      this.id = data.id;
      this.created = new Date(data.created);
      this.timestamp = new Date(data.timestamp);
      this.eTag = data.eTag;
      this.number = data.number;
      this.name = {
        translation: {
          ...data.name.translation,
        },
      };
      this.description = {
        translation: {
          ...data.description.translation,
        },
      };
      this.registrationLink = data.registrationLink;
      this.location = {
        ...data.location,
      };
      this.schedule = {
        ...data.schedule,
        closeDate: data.schedule.closeDate ? new Date(data.schedule.closeDate) : null,
        openDate: data.schedule.openDate ? new Date(data.schedule.openDate) : null,
        scheduledCloseDate: data.schedule.scheduledCloseDate ? new Date(data.schedule.scheduledCloseDate) : null,
        scheduledOpenDate: data.schedule.scheduledOpenDate ? new Date(data.schedule.scheduledOpenDate) : null,
      };
      this.registrationLink = {
        translation: {
          ...data.registrationLink.translation,
        },
      };
      this.responseDetails = {
        ...data.responseDetails,
        dateReported: data.responseDetails.dateReported ? new Date(data.responseDetails.dateReported) : null,
      };
      this.relatedEvents = [...data.relatedEvents];
    } else {
      this.reset();
    }
  }

  private reset() {
    this.name = utils.initMultilingualAttributes();
    this.description = utils.initMultilingualAttributes();
    this.location = {
      province: null,
      provinceOther: utils.initMultilingualAttributes(),
      region: utils.initMultilingualAttributes(),
    };
    this.schedule = {
      openDate: null,
      closeDate: null,
      scheduledOpenDate: null,
      scheduledCloseDate: null,
      closeReason: '',
      status: EEventStatus.OnHold,
    };
    this.responseDetails = {
      responseLevel: null,
      eventType: '',
      dateReported: null,
      assistanceNumber: '',
    };
    this.registrationLink = utils.initMultilingualAttributes();
    this.relatedEvents = [];
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
