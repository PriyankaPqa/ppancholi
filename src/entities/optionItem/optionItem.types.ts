import { IMultilingual } from '@/types';

export enum EOptionListItemStatus {
  Active = 1,
  Inactive,
}

export enum EOptionLists {
  EventTypes = 1,
  Genders,
  PreferredLanguages,
  PrimarySpokenLanguages,
}

export interface IOptionItemData {
  id?: string;
  created?: Date;
  timestamp?: Date;
  eTag?: string;
  name: IMultilingual;
  orderRank: number;
  status: EOptionListItemStatus;
  isOther: boolean;
  isDefault: boolean;
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
