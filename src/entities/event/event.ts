import { IMultilingual } from '../../types';
import { IShelterLocationData } from '../household-create';
import {
  IEvent, IEventData, IEventGenericLocation, IEventSchedule, IResponseDetails,
} from './event.types';

export class Event implements IEvent {
  id: string;

  name: IMultilingual;

  registrationLink: IMultilingual;

  responseDetails: IResponseDetails;

  tenantId: uuid;

  shelterLocations: IShelterLocationData[];

  registrationLocations: IEventGenericLocation[];

  selfRegistrationEnabled: boolean;

  schedule: IEventSchedule;

  constructor(data?: IEventData) {
    if (data) {
      this.id = data.id;
      this.responseDetails = data.responseDetails;
      this.name = data.name;
      this.registrationLink = data.registrationLink;
      this.tenantId = data.tenantId;
      this.shelterLocations = data.shelterLocations;
      this.registrationLocations = data.registrationLocations;
      this.schedule = data.schedule;
      this.selfRegistrationEnabled = data.selfRegistrationEnabled;
    }
  }
}
