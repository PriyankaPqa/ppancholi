import { BaseEntity } from '@/entities/base/base';
import { IListOption } from '@/types';
import { ICaseFileReferralEntity, ReferralMethod } from './case-file-referral.types';

export class CaseFileReferralEntity extends BaseEntity implements ICaseFileReferralEntity {
  caseFileId: uuid;

  name: string;

  note: string;

  method: ReferralMethod;

  type: IListOption;

  outcomeStatus: IListOption;

  constructor(data: ICaseFileReferralEntity) {
    if (data) {
      super(data);
      this.caseFileId = data.caseFileId;
      this.name = data.name;
      this.note = data.note;
      this.method = data.method;
      this.type = data.type;
      this.outcomeStatus = data.outcomeStatus;
    } else {
      super();
      this.caseFileId = null;
      this.name = null;
      this.note = null;
      this.method = null;
      this.type = null;
      this.outcomeStatus = null;
    }
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.caseFileId) {
      errors.push('The case file id is required');
    }

    if (!this.name) {
      errors.push('The name is required');
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
