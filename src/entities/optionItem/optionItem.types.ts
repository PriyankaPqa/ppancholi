import { IMultilingual } from '@/types';

export enum EOptionListItemStatus {
  Active = 1,
  Inactive = 2,
}

export enum EOptionLists {
  EventTypes = 1,
  Genders = 2,
  PreferredLanguages = 3,
  PrimarySpokenLanguages = 4,
  AgreementTypes = 5,
  Roles = 6,
  CaseFileTags = 7,
  CaseFileInactiveReasons = 8,
  CaseNoteCategories= 9,
  CaseFileCloseReasons = 10,
  FinancialAssistance = 11,
}

export interface IOptionSubItem {
  id?: string;
  created?: Date;
  timestamp?: Date;
  eTag?: string;
  name: IMultilingual;
  orderRank: number;
  status: EOptionListItemStatus;
  isOther: boolean;
  isDefault: boolean;
  description?: IMultilingual;
}

export interface IOptionItemData {
  id?: string;
  created?: Date;
  timestamp?: Date;
  eTag?: string;
  name: IMultilingual;
  description?: IMultilingual;
  orderRank: number;
  status: EOptionListItemStatus;
  isOther: boolean;
  isDefault: boolean;
  subitems: IOptionSubItem[];
}

export interface IOptionItem {
  id?: string;
  created?: Date;
  timestamp?: Date;
  eTag?: string;
  name: IMultilingual;
  orderRank: number;
  status: EOptionListItemStatus;
  isOther: boolean;
  isDefault: boolean;
  description?: IMultilingual;
  subitems: IOptionSubItem[];
}

/**
 * Create event payload interface
 */
export interface ICreateOptionItemRequest {
  name: IMultilingual;
  orderRank: number;
  status: EOptionListItemStatus;
  description?: IMultilingual;
}
