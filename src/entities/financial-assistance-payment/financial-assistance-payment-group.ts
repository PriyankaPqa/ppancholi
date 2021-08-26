import {
  IFinancialAssistancePaymentGroup,
  IGroupingInformation,
  PaymentStatus,
  IFinancialAssistancePaymentLine,
} from './financial-assistance-payment.types';
import { BaseEntity } from '@/entities/base/base';

export class FinancialAssistancePaymentGroup extends BaseEntity implements IFinancialAssistancePaymentGroup {
  groupingInformation: IGroupingInformation;

  paymentStatus: PaymentStatus;

  lines: IFinancialAssistancePaymentLine[];

  constructor(data?: IFinancialAssistancePaymentGroup) {
    if (data) {
      super(data);
      this.groupingInformation = data.groupingInformation;
      this.paymentStatus = data.paymentStatus;
      this.lines = data.lines;
    } else {
      super();
      this.groupingInformation = null;
      this.paymentStatus = PaymentStatus.New;
      this.lines = [];
    }
  }
}
