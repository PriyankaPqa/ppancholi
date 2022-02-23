import { TranslateResult } from 'vue-i18n';
import { BaseEntity } from '@/entities/base/base';
import { i18n } from '@/ui/plugins/i18n';
import {
  IFinancialAssistancePaymentGroup,
  IGroupingInformation,
  PaymentStatus,
  IFinancialAssistancePaymentLine,
  PayeeType,
  EPaymentCancellationReason,
} from './financial-assistance-payment.types';
import { EPaymentModalities } from '../program';
import { Status } from '../base';

export class FinancialAssistancePaymentGroup extends BaseEntity implements IFinancialAssistancePaymentGroup {
  groupingInformation: IGroupingInformation;

  paymentStatus: PaymentStatus;

  lines: IFinancialAssistancePaymentLine[];

  cancellationReason: EPaymentCancellationReason;

  cancellationDate: string | Date;

  cancellationBy: uuid;

  constructor(data?: IFinancialAssistancePaymentGroup) {
    if (data) {
      super(data);
      this.groupingInformation = data.groupingInformation;
      this.paymentStatus = data.paymentStatus;
      this.lines = data.lines;
      this.cancellationReason = data.cancellationReason;
      this.cancellationDate = data.cancellationDate;
      this.cancellationBy = data.cancellationBy;
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

  static groupTitle(paymentGroup: IFinancialAssistancePaymentGroup) : string | TranslateResult {
    if (FinancialAssistancePaymentGroup.showPayee(paymentGroup)) {
      const modality = i18n.t(`enums.PaymentModality.${EPaymentModalities[paymentGroup.groupingInformation.modality]}`);
      const payeeType = i18n.t(`enums.payeeType.${PayeeType[paymentGroup.groupingInformation.payeeType]}`);

      return `${modality} (${payeeType}) - ${paymentGroup.groupingInformation.payeeName}`;
    }

    return i18n.t(`enums.PaymentModality.${EPaymentModalities[paymentGroup.groupingInformation.modality]}`);
  }

  static total(paymentGroups: IFinancialAssistancePaymentGroup[]): number {
    let total = 0;

    paymentGroups.forEach((group: IFinancialAssistancePaymentGroup) => {
      if (group.paymentStatus !== PaymentStatus.Cancelled && group.status === Status.Active) {
        group.lines?.forEach((line: IFinancialAssistancePaymentLine) => {
          if (line.status === Status.Active) {
            total += Number(line.actualAmount != null ? line.actualAmount : line.amount);
          }
        });
      }
    });

    return Math.round(total * 100) / 100;
  }
}
