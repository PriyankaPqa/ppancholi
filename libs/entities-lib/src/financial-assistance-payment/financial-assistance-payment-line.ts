import { BaseEntity, Status } from '../base';
import { IAddress } from '../value-objects/address';
import {
  IFinancialAssistancePaymentLine,
} from './financial-assistance-payment.types';

export class FinancialAssistancePaymentLine extends BaseEntity implements IFinancialAssistancePaymentLine {
  mainCategoryId: string;

  subCategoryId: string | null;

  documentReceived: boolean;

  amount: number;

  actualAmount: number;

  relatedNumber: string;

  careOf: string;

  address: IAddress;

  constructor(data?: IFinancialAssistancePaymentLine) {
    if (data) {
      super(data);
      this.mainCategoryId = data.mainCategoryId;
      this.subCategoryId = data.subCategoryId;
      this.documentReceived = data.documentReceived;
      this.amount = data.amount;
      this.actualAmount = data.actualAmount;
      this.relatedNumber = data.relatedNumber;
      this.careOf = data.careOf;
      this.address = data.address;
    } else {
      super();
      this.mainCategoryId = null;
      this.subCategoryId = null;
      this.documentReceived = false;
      this.amount = null;
      this.actualAmount = null;
      this.relatedNumber = null;
      this.careOf = null;
      this.address = null;
      this.status = Status.Active;
    }
  }
}
