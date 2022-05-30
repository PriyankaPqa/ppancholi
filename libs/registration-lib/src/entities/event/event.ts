import _cloneDeep from 'lodash/cloneDeep';
import utils from '@libs/core-lib/entities/utils';
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
      this.responseDetails = _cloneDeep(data.responseDetails);
      this.name = utils.initMultilingualAttributes(data.name);
      this.registrationLink = utils.initMultilingualAttributes(data.registrationLink);
      this.tenantId = data.tenantId;
      this.shelterLocations = _cloneDeep(data.shelterLocations) || [];
      this.registrationLocations = _cloneDeep(data.registrationLocations) || [];
      this.schedule = _cloneDeep(data.schedule);
      this.selfRegistrationEnabled = data.selfRegistrationEnabled;
    }
  }
}
