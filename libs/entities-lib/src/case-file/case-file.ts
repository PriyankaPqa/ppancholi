import _cloneDeep from 'lodash/cloneDeep';
import { IListOption } from '@libs/shared-lib/types';
import { BaseEntity } from '../base';
import {
  CaseFileStatus, CaseFileTriage, IAssignedTeamMembers, ICaseFileEntity, ICaseFileLabel,
  IdentityAuthenticationMethod, IdentityAuthenticationStatus, IIdentityAuthentication,
  IImpactStatusValidation,
  ImpactValidationMethod, ValidationOfImpactStatus,
} from './case-file.types';

export class CaseFileEntity extends BaseEntity implements ICaseFileEntity {
  assignedIndividualIds?: uuid[];

  assignedTeamMembers?: IAssignedTeamMembers[];

  assignedTeamIds?: uuid[];

  caseFileNumber?: string;

  caseFileStatus?: CaseFileStatus;

  eventId?: uuid;

  householdId?: uuid;

  impactStatusValidation?: IImpactStatusValidation;

  isDuplicate?: boolean;

  labels?: ICaseFileLabel[];

  tags?: IListOption[];

  triage?: CaseFileTriage;

  identityAuthentication?: IIdentityAuthentication;

  privacyDateTimeConsent?: Date | string;

  constructor(data?: ICaseFileEntity) {
    if (data) {
      super(data);
      this.assignedTeamMembers = data.assignedTeamMembers ? _cloneDeep(data.assignedTeamMembers) : [];
      this.assignedIndividualIds = data.assignedIndividualIds ? [...data.assignedIndividualIds] : [];
      this.assignedTeamIds = data.assignedTeamIds ? [...data.assignedTeamIds] : [];
      this.caseFileNumber = data.caseFileNumber;
      this.caseFileStatus = data.caseFileStatus;
      this.eventId = data.eventId;
      this.householdId = data.householdId;
      this.impactStatusValidation = _cloneDeep(data.impactStatusValidation)
        || { method: ImpactValidationMethod.NotApplicable, status: ValidationOfImpactStatus.Undetermined };
      this.isDuplicate = data.isDuplicate;
      this.tags = _cloneDeep(data.tags) || [];
      this.labels = _cloneDeep(data.labels) || [];
      this.triage = data.triage;
      this.privacyDateTimeConsent = new Date(data.privacyDateTimeConsent);
      this.identityAuthentication = _cloneDeep(data.identityAuthentication) || {
        identificationIds: [],
        method: IdentityAuthenticationMethod.NotApplicable,
        status: IdentityAuthenticationStatus.NotVerified,
      };
    } else {
      super();
      this.assignedIndividualIds = [];
      this.assignedTeamMembers = [];
      this.assignedTeamIds = [];
      this.caseFileNumber = null;
      this.caseFileStatus = null;
      this.eventId = null;
      this.householdId = null;
      this.impactStatusValidation = { method: ImpactValidationMethod.NotApplicable, status: ValidationOfImpactStatus.Undetermined };
      this.isDuplicate = false;
      this.tags = [];
      this.labels = [];
      this.triage = null;
      this.privacyDateTimeConsent = null;
      this.identityAuthentication = {
        identificationIds: [],
        method: IdentityAuthenticationMethod.NotApplicable,
        status: IdentityAuthenticationStatus.NotVerified,
      };
    }
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.householdId) {
      errors.push('The household id is required');
    }

    if (!this.caseFileNumber) {
      errors.push('The case file number is required');
    }

    if (!this.caseFileStatus) {
      errors.push('The case file status is required');
    }

    if (!this.eventId) {
      errors.push('The event id is required');
    }

    if (!this.triage) {
      errors.push('The triage level is required');
    }
  }

  /**
   * Validate business rules (non specific to the application)
   */
  validate(): Array<string> | boolean {
    const errors: Array<string> = [];

    this.validateAttributes(errors);
    if (!errors.length) {
      return true;
    }

    return errors;
  }
}
