import { IListOption, IMultilingual } from '@/types';
import { IEntity, IEntityCombined } from '../base';

export enum ReferralMethod {
  Referral = 1,
  Warm = 2
}

export interface ICaseFileReferralEntity extends IEntity {
  caseFileId: uuid;
  name: string;
  note: string;
  method: ReferralMethod;
  type: IListOption;
  outcomeStatus: IListOption;

  validate(): Array<string> | boolean;
}

export interface ICaseFileReferralMetadata extends IEntity {
  referralTypeName: IMultilingual;
  referralOutcomeStatusName: IMultilingual;
}

export type ICaseFileReferralCombined = IEntityCombined<ICaseFileReferralEntity, ICaseFileReferralMetadata>
