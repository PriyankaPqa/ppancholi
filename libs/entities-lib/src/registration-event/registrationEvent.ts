import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';
import { IEventSummary, IRegistrationAssessment, IEventResponseDetails, IEventGenericLocation, EEventStatus } from '../event';
import utils from '../utils';

export class RegistrationEvent implements IEventSummary {
  id: string;

  name: IMultilingual;

  registrationLink: IMultilingual;

  responseDetails: IEventResponseDetails;

  tenantId: uuid;

  shelterLocations: IEventGenericLocation[];

  registrationLocations: IEventGenericLocation[];

  registrationAssessments: IRegistrationAssessment[];

  selfRegistrationEnabled: boolean;

  schedule: { status: EEventStatus; openDate?: Date | string; };

  consentStatementId?: uuid;

  constructor(data?: IEventSummary) {
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
