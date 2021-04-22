import { IMultilingual } from '@/types';
import utils from '../utils';
import {
  ECaseFileStatus, ETriageLevel, ICaseFile, ICaseFileBeneficiary, ICaseFileEvent, ICaseFileSearchData,
} from './case-file.types';

export class CaseFile implements ICaseFile {
  id: uuid;

  beneficiary: ICaseFileBeneficiary;

  caseFileNumber: string;

  caseFileStatus: ECaseFileStatus;

  caseFileStatusName: IMultilingual;

  created: Date | string;

  event: ICaseFileEvent;

  isDuplicate: boolean;

  triage: ETriageLevel;

  triageName: IMultilingual;

  tenantId: uuid;

  constructor(data: ICaseFileSearchData) {
    this.id = data.caseFileId;

    this.beneficiary = {
      ...data.beneficiary,
      contactInformation: {
        ...data.beneficiary.contactInformation,
        mobilePhoneNumber: data.beneficiary.contactInformation?.mobilePhoneNumber
          ? { ...data.beneficiary.contactInformation.mobilePhoneNumber }
          : null,
        homePhoneNumber: data.beneficiary.contactInformation?.homePhoneNumber
          ? { ...data.beneficiary.contactInformation?.homePhoneNumber }
          : null,
        alternatePhoneNumber: data.beneficiary.contactInformation?.alternatePhoneNumber
          ? { ...data.beneficiary.contactInformation?.alternatePhoneNumber }
          : null,
      },
      homeAddress: data.beneficiary.homeAddress ? {
        ...data.beneficiary.homeAddress,
        provinceCode: utils.initMultilingualAttributes(data.beneficiary.homeAddress?.provinceCode),
      } : null,
    };

    this.caseFileNumber = data.caseFileNumber;

    this.caseFileStatus = data.caseFileStatus;

    this.caseFileStatusName = utils.initMultilingualAttributes(data.caseFileStatusName);

    this.created = new Date(data.caseFileCreatedDate);

    this.event = {
      id: data.event?.id,
      name: utils.initMultilingualAttributes(data.event?.name),
    };

    this.isDuplicate = data.duplicate;

    this.triage = data.triage;

    this.triageName = utils.initMultilingualAttributes(data.triageName);

    this.tenantId = data.tenantId;
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.beneficiary.id) {
      errors.push('The beneficiary id is required');
    }

    if (!this.caseFileNumber) {
      errors.push('The case file number is required');
    }

    if (!this.caseFileStatus) {
      errors.push('The case file status is required');
    }

    if (!this.event.id) {
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
