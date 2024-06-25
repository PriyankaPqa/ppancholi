import { IMultilingual } from '@libs/shared-lib/types';
import { IEntity } from '../base';

export enum EPaymentModalities {
  ETransfer = 1,
  Cheque = 2,
  DirectDeposit = 3,
  GiftCard = 4,
  Invoice = 5,
  PrepaidCard = 6,
  Voucher = 7,
}

export interface IEligibilityCriteria {
  authenticated: boolean;
  impacted: boolean;
  completedAssessments: boolean;
  completedAssessmentIds: uuid[];
}

export interface IProgramEntityData extends IEntity {
  eventId: uuid;
  name: IMultilingual;
  description: IMultilingual;
  approvalRequired: boolean;
  useForLodging: boolean;
  eligibilityCriteria: IEligibilityCriteria;
  paymentModalities: EPaymentModalities[];
}

export interface IProgramEntity extends IProgramEntityData {
  fillEmptyMultilingualAttributes(): void;
}

export type IdParams = { id: string; eventId: string };
