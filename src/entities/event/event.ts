import { IMultilingual } from '../../types';
import { IShelterLocation } from '../beneficiary';
import {
  IEvent, IEventData, IEventGenericLocation, IResponseDetails,
} from './event.types';

export class Event implements IEvent {
  id: string;

  name: IMultilingual;

  registrationLink: IMultilingual;

  responseDetails: IResponseDetails;

  tenantId: uuid;

  shelterLocations: IShelterLocation[];

  registrationLocations: IEventGenericLocation[];

  constructor(data?: IEventData) {
    if (data) {
      this.id = data.eventId;
      this.responseDetails = data.responseDetails;
      this.name = {
        translation: {
          ...data.eventName.translation,
        },
      };
      this.registrationLink = {
        translation: {
          ...data.registrationLink.translation,
        },
      };
      this.tenantId = data.tenantId;
      this.shelterLocations = data.shelterLocations;
      this.registrationLocations = data.registrationLocations;
    }
  }
}
