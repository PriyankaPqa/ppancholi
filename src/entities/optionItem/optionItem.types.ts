import { IMultilingual } from '@/types';

export enum EOptionListItemStatus {
  Active = 1,
  Inactive,
}

export enum EOptionLists {
  EventTypes = 1,
  Gender,
}

export interface IOptionItemData {
  id?: string;
  created?: Date;
  timestamp?: Date;
  eTag?: string;
  name: IMultilingual;
  orderRank: number;
  status: EOptionListItemStatus;
  itemStatus: EOptionListItemStatus;
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
  itemStatus: EOptionListItemStatus;
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
  itemStatus: EOptionListItemStatus;
  description?: IMultilingual;
}
