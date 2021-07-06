import { BaseEntity } from '@/entities/base/base';
import { IListOption } from '@/types';
import {
  CaseFileStatus, CaseFileTriage, ICaseFileEntity, ICaseFileLabel,
} from './case-file.types';

export class CaseFileEntity extends BaseEntity {
  assignedIndividualIds?: uuid[];

  assignedTeamIds?: uuid[];

  caseFileNumber?: string;

  caseFileStatus?: CaseFileStatus;

  eventId?: uuid;

  householdId?: uuid;

  isDuplicate?: boolean;

  labels?: ICaseFileLabel[];

  tags?: IListOption[];

  triage?: CaseFileTriage;

  privacyDateTimeConsent?: Date | string;

  constructor(data?: ICaseFileEntity) {
    if (data) {
      super(data);
      this.assignedIndividualIds = [...data.assignedIndividualIds];
      this.assignedTeamIds = [...data.assignedTeamIds];
      this.caseFileNumber = data.caseFileNumber;
      this.caseFileStatus = data.caseFileStatus;
      this.eventId = data.eventId;
      this.householdId = data.householdId;
      this.isDuplicate = data.isDuplicate;
      this.tags = data.tags;
      this.labels = data.labels;
      this.triage = data.triage;
      this.privacyDateTimeConsent = new Date(data.privacyDateTimeConsent);
    } else {
      super();
      this.assignedIndividualIds = [];
      this.assignedTeamIds = [];
      this.caseFileNumber = null;
      this.caseFileStatus = null;
      this.eventId = null;
      this.householdId = null;
      this.isDuplicate = false;
      this.tags = [];
      this.labels = [];
      this.triage = null;
      this.privacyDateTimeConsent = null;
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
