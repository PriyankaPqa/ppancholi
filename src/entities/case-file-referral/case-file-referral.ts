import { BaseEntity } from '@/entities/base/base';
import { IListOption } from '@/types';
import { ICaseFileReferralEntity, IReferralConsentInformation, ReferralMethod } from './case-file-referral.types';

export class CaseFileReferralEntity extends BaseEntity implements ICaseFileReferralEntity {
  caseFileId: uuid;

  name: string;

  note: string;

  method: ReferralMethod;

  type: IListOption;

  outcomeStatus: IListOption;

  referralConsentInformation: IReferralConsentInformation;

  constructor(data?: ICaseFileReferralEntity) {
    if (data) {
      super(data);
      this.caseFileId = data.caseFileId;
      this.name = data.name;
      this.note = data.note;
      this.method = data.method;
      this.type = data.type;
      this.outcomeStatus = data.outcomeStatus;
      this.referralConsentInformation = data.referralConsentInformation;
      if (this.referralConsentInformation?.dateTimeConsent) {
        this.referralConsentInformation.dateTimeConsent = new Date(this.referralConsentInformation.dateTimeConsent);
      }
    } else {
      super();
      this.caseFileId = null;
      this.name = null;
      this.note = null;
      this.method = ReferralMethod.Referral;
      this.type = { optionItemId: null, specifiedOther: null };
      this.outcomeStatus = null;
      this.referralConsentInformation = null;
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
