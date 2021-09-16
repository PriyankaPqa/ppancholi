import {
  IFinancialAssistancePaymentGroup,
  IGroupingInformation,
  PaymentStatus,
  IFinancialAssistancePaymentLine,
} from './financial-assistance-payment.types';
import { BaseEntity } from '@/entities/base/base';
import { EPaymentModalities } from '../program';

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

  static showRelatedNumber(modalityOrGroup: EPaymentModalities | IFinancialAssistancePaymentGroup): boolean {
    const modality = typeof (modalityOrGroup) === 'object' ? modalityOrGroup?.groupingInformation?.modality : modalityOrGroup;
    return modality === EPaymentModalities.PrepaidCard
    || modality === EPaymentModalities.GiftCard
    || modality === EPaymentModalities.Voucher
    || modality === EPaymentModalities.Invoice;
  }

  static showIssuedActualAmounts(modalityOrGroup: EPaymentModalities | IFinancialAssistancePaymentGroup): boolean {
    const modality = typeof (modalityOrGroup) === 'object' ? modalityOrGroup?.groupingInformation?.modality : modalityOrGroup;
    return modality === EPaymentModalities.Voucher
      || modality === EPaymentModalities.Invoice;
  }

  static showPayee(modalityOrGroup: EPaymentModalities | IFinancialAssistancePaymentGroup): boolean {
    const modality = typeof (modalityOrGroup) === 'object' ? modalityOrGroup?.groupingInformation?.modality : modalityOrGroup;
    return modality === EPaymentModalities.Cheque;
  }
}
