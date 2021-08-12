import { IEntity, IEntityCombined } from '@/entities/base/base.types';
import { IAddress } from '@/types';
import { EPaymentModalities } from '@/entities/program/program.types';

/**
 * Enums
 */
export enum FPayeeType {
  Beneficiary = 1,
  ThirdParty = 2
}

export enum FPaymentStatus
{
  New = 1,
  InProgress = 2,
  Sent = 3,
  Issued = 4,
  Completed = 5,
  Cancelled = 6
}

/**
 * Value objects
 */
export interface ICaseFinancialAssisstancePaymentLines {
  mainCategoryId?: uuid,
  subCategoryId?: uuid,
  documentReceived?: boolean,
  amount?: number,
  actualAmount?: number,
  relatedNumber?: string,
  careOf?: string,
  address?: IAddress,
}

export interface ICaseFinancialAssistancePaymentGroups {
  modality?: EPaymentModalities,
  payeeType?: FPayeeType,
  payeeName?: string,
  lines?: Array<ICaseFinancialAssisstancePaymentLines>,
}

export interface ICaseFinancialAssistanceEntity extends IEntity {
  caseFileId?: uuid,
  financialAssistanceTableId?: uuid,
  name?: string,
  description?: string,
  paymentStatus?: FPaymentStatus,
  groups?: Array<ICaseFinancialAssistancePaymentGroups>,
}

export interface ICaseFinancialAssistanceMetadata extends IEntity {}

export type ICaseFinancialAssistanceCombined = IEntityCombined<ICaseFinancialAssistanceEntity, ICaseFinancialAssistanceMetadata>
