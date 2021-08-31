import { IEntity, IEntityCombined } from '@/entities/base/base.types';
import { IAddress, IMultilingual } from '@/types';
import { EPaymentModalities } from '@/entities/program/program.types';

/**
 * Enums
 */
export enum PayeeType {
  Beneficiary = 1,
  ThirdParty = 2
}

export enum PaymentStatus
{
  New = 1,
  InProgress = 2,
  Sent = 3,
  Issued = 4,
  Completed = 5,
  Cancelled = 6
}

export enum ApprovalStatus {
  New = 1,
  Pending = 2,
  Approved = 3,
  Declined = 4
}

export enum EPaymentCancellationReason {
  AdminCancellation = 'AdminCancellation',
  RecipientRejected = 'RecipientRejected',
  InvalidPin = 'InvalidPin',
  Expired = 'Expired',
  AdminCancellation2 = 'AdminCancellation2',
  FailedDelivery = 'FailedDelivery',
}

/**
 * Value objects
 */
export interface IFinancialAssistancePaymentLine {
  mainCategoryId: string;
  subCategoryId: string | null;
  documentReceived: boolean;
  amount: number;
  actualAmount: number;
  relatedNumber: string;
  careOf: string;
  address: IAddress;
}

export interface IGroupingInformation {
  modality: EPaymentModalities;
  payeeType: PayeeType;
  payeeName: string;
}

export interface IFinancialAssistancePaymentGroup extends IEntity {
  groupingInformation: IGroupingInformation;
  paymentStatus: PaymentStatus;
  lines: IFinancialAssistancePaymentLine[];
}

export interface IFinancialAssistancePaymentEntity extends IEntity {
  caseFileId: uuid,
  financialAssistanceTableId: uuid,
  name: string,
  description: string,
  approvalStatus: ApprovalStatus,
  groups?: Array<IFinancialAssistancePaymentGroup>,
}

export interface IFinancialAssistancePaymentMetadata extends IEntity {
  total: number;
  approvalStatusName: IMultilingual;
}

export type IFinancialAssistancePaymentCombined = IEntityCombined<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata>

export interface CreatePaymentGroupServiceRequest {
  modality: EPaymentModalities;
  payeeType: PayeeType;
  payeeName: string;
  lines: IFinancialAssistancePaymentLine[];
}

export interface CreateFinancialAssistancePaymentServiceRequest {
  caseFileId: string;
  financialAssistanceTableId: string;
  name: string;
  description: string;
  groups: CreatePaymentGroupServiceRequest[];
}
