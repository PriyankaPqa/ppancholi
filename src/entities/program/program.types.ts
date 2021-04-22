import { IMultilingual } from '@/types';

/**
 * Enums
 */
export enum EProgramStatus {
  Active = 1,
  Inactive = 2,
}

export enum EPaymentModalities {
  EFT = 1,
  Cheque = 2,
  DirectDeposit = 3,
  GiftCard = 4,
  Invoice = 5,
  PrepaidCard = 6,
  Voucher = 7,
}

/**
 * Value objects
 */
export interface IEligibilityCriteria {
  authenticated: boolean;
  impacted: boolean;
  completedAssessments: boolean;
}

/**
 * Interfaces
 */

export interface ICreateProgramRequest {
  name: IMultilingual;
  description: IMultilingual;
  eventId: uuid;
  paymentModalities: EPaymentModalities[];
  eligibilityCriteria: IEligibilityCriteria;
  approvalRequired: boolean;
  programStatus: EProgramStatus;
}

export interface IProgramData {
  id: uuid;
  created: Date | string;
  timestamp: Date | string;
  eTag: string;
  eventId: uuid;
  name: IMultilingual;
  description: IMultilingual;
  approvalRequired: boolean;
  eligibilityCriteria: IEligibilityCriteria;
  programStatus: EProgramStatus;
  paymentModalities: EPaymentModalities[];
}

export interface IProgramSearchData {
  programId: uuid;
  createdDate: Date | string;
  eventId: uuid;
  programName: IMultilingual;
  programDescription: IMultilingual;
  approvalRequired: boolean;
  eligibilityCriteria: IEligibilityCriteria;
  programStatus: EProgramStatus;
  programStatusName: IMultilingual;
  paymentModalities: EPaymentModalities[];
}

export interface IProgram {
  id: uuid;
  created: Date | string;
  eventId: uuid;
  name: IMultilingual;
  description: IMultilingual;
  approvalRequired: boolean;
  eligibilityCriteria: IEligibilityCriteria;
  programStatus: EProgramStatus;
  paymentModalities: EPaymentModalities[];
  fillEmptyMultilingualAttributes(): void;
}
