import { IMultilingual } from '@libs/shared-lib/types';
import { EPaymentModalities } from '../program/program.types';
import { IAddress } from '../value-objects/address';
import { IEntity, IEntityCombined } from '../base';

/**
 * Enums
 */
export enum PayeeType {
  Beneficiary = 1,
  ThirdParty = 2,
}

export enum PaymentStatus {
  New = 1,
  InProgress = 2,
  Sent = 3,
  Issued = 4,
  Completed = 5,
  Cancelled = 6,
}

export enum ApprovalStatus {
  New = 1,
  Pending = 2,
  Approved = 3,
  Declined = 4,
}

export enum ApprovalAction {
    Submitted = 1,
    RequestAdditionalInfo = 2,
    Approved = 3,
    Declined = 4,
}

export enum EPaymentCancellationReason {
  AdminCancellation0 = 0,
  RecipientRejected = 1,
  InvalidPIN = 2,
  Expired = 3,
  AdminCancellation4 = 4,
  FailedDelivery = 5,
}

/**
 * Value objects
 */
export interface IFinancialAssistancePaymentLine extends IEntity {
  id: string;
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
  cancellationReason: EPaymentCancellationReason;
  cancellationDate: string | Date;
  cancellationBy: uuid;
  groupingInformation: IGroupingInformation;
  paymentStatus: PaymentStatus;
  lines: IFinancialAssistancePaymentLine[];
}

export interface IApprovalTableGroupsSnapshot {
  roles: Array<uuid>;
  minimumAmount: number;
  maximumAmount: number;
  isApproved: boolean;
}

export interface IApprovalActionPayload {
  approvalAction: ApprovalAction;
  submittedTo: uuid;
  rationale: string;
}

export interface IFinancialAssistancePaymentEntity extends IEntity {
  caseFileId: uuid,
  financialAssistanceTableId: uuid,
  name: string,
  description: string,
  approvalStatus: ApprovalStatus,
  approvalAction: ApprovalAction,
  groups?: Array<IFinancialAssistancePaymentGroup>,
  approvalTableGroupsSnapshots? : Array<IApprovalTableGroupsSnapshot>,
  submissionStartedDate?: string | Date;
  initialSubmitter?: uuid;
  submittedBy?: { userId: string, userName: string, roleName: IMultilingual };
  submittedTo?: { userId: string, userName: string, roleName: IMultilingual };
}

export interface IFinancialAssistancePaymentMetadata extends IEntity {
  total: number;
  approvalStatusName: IMultilingual;
  eventId?: string;
  eventName? : string;
  submittedByName?: string;
  submittedToName?: string;
}

export type IFinancialAssistancePaymentCombined = IEntityCombined<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata>;

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

export interface PaymentModalityCount {
  modality: EPaymentModalities;
  count: number;
}

export interface PaymentsSummary {
  paymentModalityCounts: PaymentModalityCount[];
  totalAmountUnapproved: number;
  totalAmountCommitted: number;
  totalAmountCompleted: number;
  grandTotalAmount: number;
}
