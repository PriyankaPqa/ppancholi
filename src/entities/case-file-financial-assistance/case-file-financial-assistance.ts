import { BaseEntity } from '@/entities/base/base';
import { ICaseFinancialAssistanceEntity, ICaseFinancialAssistancePaymentGroups, FPaymentStatus } from './case-file-financial-assistance.types';

export class CaseFinancialAssistanceEntity extends BaseEntity {
  caseFileId: uuid;

  financialAssistanceTableId: uuid;

  name: string;

  description: string;

  groups: Array<ICaseFinancialAssistancePaymentGroups>;

  paymentStatus: FPaymentStatus;

  constructor(data?: ICaseFinancialAssistanceEntity) {
    if (data) {
      super(data);
      this.caseFileId = data.caseFileId;
      this.financialAssistanceTableId = data.financialAssistanceTableId;
      this.name = data.name;
      this.description = data.description;
      this.paymentStatus = data.paymentStatus;
      this.groups = data.groups;
    } else {
      super();
      this.caseFileId = null;
      this.financialAssistanceTableId = null;
      this.name = null;
      this.description = null;
      this.paymentStatus = FPaymentStatus.New;
      this.groups = null;
    }
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.name) {
      errors.push('The name is required');
    }

    if (!this.groups) {
      errors.push('At least one payment line is required');
    }

    if (!this.financialAssistanceTableId) {
      errors.push('The financial assistance table is required');
    }

    if (!this.caseFileId) {
      errors.push('A linked case-file is required');
    }
  }

  validate(): Array<string> | boolean {
    const errors: Array<string> = [];

    this.validateAttributes(errors);
    if (!errors.length) {
      return true;
    }
    return errors;
  }
}
