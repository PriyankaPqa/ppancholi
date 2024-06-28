import { IMultilingual, Status } from '@libs/shared-lib/types';
import { IEntity } from '../base';

export enum EOptionLists {
  EventTypes = 1,
  Genders = 2,
  PreferredLanguages = 3,
  PrimarySpokenLanguages = 4,
  AgreementTypes = 5,
  Roles = 6,
  CaseFileTags = 7,
  CaseFileInactiveReasons = 8,
  CaseNoteCategories = 9,
  CaseFileCloseReasons = 10,
  FinancialAssistanceCategories = 11,
  ScreeningId = 12,
  ReferralOutcomeStatus = 13,
  ReferralTypes = 14,
  DocumentCategories = 15,
  ExceptionalAuthenticationTypes = 16,
  TaskCategories = 17,
}

export interface IOptionSubItem extends IEntity {
  name: IMultilingual;
  orderRank: number;
  isOther: boolean;
  isDefault: boolean;
  restrictFinancial: boolean;
  isLodging?: boolean;
  description?: IMultilingual;
}

export interface IOptionItemData extends IEntity {
  name: IMultilingual;
  description?: IMultilingual;
  orderRank: number;
  isOther: boolean;
  isHidden: boolean;
  isDefault: boolean;
  restrictFinancial: boolean;
  isLodging?: boolean;
  subitems: IOptionSubItem[];
  isOnline?: boolean;
}

export interface IOptionItem extends IOptionItemData {}

/**
 * Create event payload interface
 */
export interface ICreateOptionItemRequest {
  name: IMultilingual;
  orderRank: number;
  status: Status;
  description?: IMultilingual;
}
