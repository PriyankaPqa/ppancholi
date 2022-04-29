import { IMultilingual } from '@/types';
import { IEntity, IEntityCombined } from '@libs/core-lib/entities/base';

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
}

export interface IProgramEntityData extends IEntity {
  eventId: uuid;
  name: IMultilingual;
  description: IMultilingual;
  approvalRequired: boolean;
  eligibilityCriteria: IEligibilityCriteria;
  paymentModalities: EPaymentModalities[];

}

export interface IProgramEntity extends IProgramEntityData {
  fillEmptyMultilingualAttributes(): void;
}

export interface IProgramMetadata extends IEntity {
  eventId: uuid;
  programStatusName: IMultilingual;
}

export type IProgramCombined = IEntityCombined<IProgramEntity, IProgramMetadata>;
