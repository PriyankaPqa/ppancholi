import _cloneDeep from 'lodash/cloneDeep';
import { Status } from '@libs/shared-lib/types';
import { format } from 'date-fns';
import { IFinancialAssistanceTableItem } from '../financial-assistance';
import { IProgramEntity } from '../program';
import { BaseEntity } from '../base';
import {
  ApprovalAction,
  ApprovalStatus,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
  IApprovalStatusHistory,
} from './financial-assistance-payment.types';

export class FinancialAssistancePaymentEntity extends BaseEntity implements IFinancialAssistancePaymentEntity {
  caseFileId: uuid;

  financialAssistanceTableId: uuid;

  name: string;

  description: string;

  groups: Array<IFinancialAssistancePaymentGroup>;

  approvalStatus: ApprovalStatus;

  approvalAction: ApprovalAction;

  approvalStatusHistory: IApprovalStatusHistory[];

  constructor(data?: IFinancialAssistancePaymentEntity) {
    if (data) {
      super(data);
      this.caseFileId = data.caseFileId;
      this.financialAssistanceTableId = data.financialAssistanceTableId;
      this.name = data.name;
      this.description = data.description;
      this.approvalStatus = data.approvalStatus;
      this.approvalAction = data.approvalAction;
      this.groups = _cloneDeep(data.groups) || [];
      this.approvalStatusHistory = data.approvalStatusHistory;
    } else {
      super();
      this.caseFileId = null;
      this.financialAssistanceTableId = null;
      this.name = null;
      this.description = null;
      this.approvalStatus = ApprovalStatus.New;
      this.approvalAction = null;
      this.groups = [];
      this.approvalStatusHistory = null;
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

  static generateName(
    param: { payment: IFinancialAssistancePaymentEntity, program: IProgramEntity, items: IFinancialAssistanceTableItem[], keepCurrentDate: boolean },
    vue: any,
  ) {
    const makePaymentLineNames = () => {
      const paymentLineIds = [] as string[];
      param.payment.groups.forEach((group) => group.lines.forEach((line) => {
        if (line.status === Status.Active) {
          paymentLineIds.push(line.mainCategoryId);
        }
      }));
      const uniquePaymentLineIds = [...new Set(paymentLineIds)];

      return uniquePaymentLineIds.map((id) => {
        const paymentLineData = param.items.find((i) => i.mainCategory.id === id);
        return paymentLineData ? vue.$m(paymentLineData.mainCategory.name) : '';
      }).join(' - ');
    };

    const programName = param.program?.name ? vue.$m(param.program.name) : '';
    const paymentLineNames = makePaymentLineNames();

    const creationTime = param.keepCurrentDate ? param.payment.name.split('-').pop().trim() : format(new Date(), 'yyyyMMdd HHmmss');
    param.payment.name = `${programName} - ${paymentLineNames} - ${creationTime}`;
  }
}
