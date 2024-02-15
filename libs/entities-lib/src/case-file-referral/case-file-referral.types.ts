import { IListOption, IMultilingualWithId } from '@libs/shared-lib/types';
import { IEntity, IEntityCombined } from '../base';

export enum ReferralMethod {
  Referral = 1,
  Warm = 2,
}

export interface IReferralConsentInformation {
  crcUserId: string;
  crcUserName: string;
  dateTimeConsent: Date;
}

export interface ICaseFileReferralEntity extends IEntity {
  caseFileId: uuid;
  name: string;
  note: string;
  method: ReferralMethod;
  type: IListOption;
  outcomeStatus: IListOption;
  referralConsentInformation: IReferralConsentInformation;

  validate(): Array<string> | boolean;
}

export interface ICaseFileReferralMetadata extends IEntity {
  referralType: IMultilingualWithId;
  referralOutcomeStatus: IMultilingualWithId;
}

export type ICaseFileReferralCombined = IEntityCombined<ICaseFileReferralEntity, ICaseFileReferralMetadata>;

export type IdParams = { id: uuid, caseFileId: uuid };
