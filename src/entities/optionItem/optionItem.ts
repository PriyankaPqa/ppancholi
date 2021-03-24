import { IMultilingual } from '@/types';
import {
  IOptionItem, IOptionItemData, EOptionListItemStatus, IOptionSubItem,
} from './optionItem.types';

export class OptionItem implements IOptionItem {
  readonly id?: string;

  readonly created?: Date;

  readonly timestamp?: Date;

  readonly eTag?: string;

  readonly name: IMultilingual;

  readonly description: IMultilingual;

  readonly orderRank: number;

  readonly status: EOptionListItemStatus;

  readonly isOther: boolean;

  readonly isDefault: boolean;

  readonly subitems: IOptionSubItem[];

  constructor(data: IOptionItemData) {
    this.id = data.id;
    this.created = data.created;
    this.timestamp = data.timestamp;
    this.eTag = data.eTag;
    this.name = data.name;
    this.description = data.description;
    this.orderRank = data.orderRank;
    this.status = data.status;
    this.isOther = data.isOther;
    this.isDefault = data.isDefault;
    this.subitems = data.subitems;
  }
}
