import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';
import { IRegistrationAssessment } from '../event';
import utils from '../utils';
import { IShelterLocationData } from '../household-create';
import {
  IEvent, IEventData, IEventGenericLocation, IEventSchedule, IResponseDetails,
} from './registrationEvent.types';

export class RegistrationEvent implements IEvent {
  id: string;

  name: IMultilingual;

  registrationLink: IMultilingual;

  responseDetails: IResponseDetails;

  tenantId: uuid;

  shelterLocations: IShelterLocationData[];

  registrationLocations: IEventGenericLocation[];

  registrationAssessments: IRegistrationAssessment[];

  selfRegistrationEnabled: boolean;

  schedule: IEventSchedule;

  consentStatementId?: uuid;

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
      this.registrationAssessments = data.registrationAssessments;
      this.consentStatementId = data.consentStatementId;
    }
  }
}
