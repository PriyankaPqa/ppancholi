import { IMultilingual } from '../../types';
import {
  IEvent, IEventData, IResponseDetails, IShelterLocation,
} from './event.types';

export class Event implements IEvent {
  id: string;

  assistanceNumber: string;

  name: IMultilingual;

  registrationLink: IMultilingual;

  responseDetails: IResponseDetails;

  tenantId: uuid;

  shelterLocations: IShelterLocation[];

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
    }
  }
}
