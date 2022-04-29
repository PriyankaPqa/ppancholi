import { BaseEntity } from '@libs/core-lib/entities/base';
import {
  ApprovalAction,
  ApprovalStatus,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
} from './financial-assistance-payment.types';

export class FinancialAssistancePaymentEntity extends BaseEntity implements IFinancialAssistancePaymentEntity {
  caseFileId: uuid;

  financialAssistanceTableId: uuid;

  name: string;

  description: string;

  groups: Array<IFinancialAssistancePaymentGroup>;

  approvalStatus: ApprovalStatus;

  approvalAction: ApprovalAction;

  constructor(data?: IFinancialAssistancePaymentEntity) {
    if (data) {
      super(data);
      this.caseFileId = data.caseFileId;
      this.financialAssistanceTableId = data.financialAssistanceTableId;
      this.name = data.name;
      this.description = data.description;
      this.approvalStatus = data.approvalStatus;
      this.approvalAction = data.approvalAction;
      this.groups = data.groups;
    } else {
      super();
      this.caseFileId = null;
      this.financialAssistanceTableId = null;
      this.name = null;
      this.description = null;
      this.approvalStatus = ApprovalStatus.New;
      this.approvalAction = null;
      this.groups = [];
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
