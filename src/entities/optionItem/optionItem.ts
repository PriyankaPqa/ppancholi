import { IMultilingual, EOptionListItemStatus } from '@/types';
import { IOptionItem, IOptionItemData } from './optionItem.types';

export class OptionItem implements IOptionItem {
  readonly id?: string;

  readonly created?: Date;

  readonly timestamp?: Date;

  readonly eTag?: string;

  readonly name: IMultilingual;

  readonly orderRank: number;

  readonly status: EOptionListItemStatus;

  readonly itemStatus: EOptionListItemStatus;

  readonly isOther: boolean;

  readonly isDefault: boolean;

  constructor(data: IOptionItemData) {
    this.id = data.id;
    this.created = data.created;
    this.timestamp = data.timestamp;
    this.eTag = data.eTag;
    this.name = data.name;
    this.orderRank = data.orderRank;
    this.status = data.status;
    this.itemStatus = data.itemStatus;
    this.isOther = data.isOther;
    this.isDefault = data.isDefault;
  }
}
