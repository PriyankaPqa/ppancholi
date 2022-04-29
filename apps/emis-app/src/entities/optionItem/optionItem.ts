import _sortBy from 'lodash/sortBy';
import { IMultilingual } from '@/types';
import { BaseEntity, Status } from '@libs/core-lib/entities/base';
import {
  IOptionItem, IOptionItemData, IOptionSubItem,
} from './optionItem.types';

export class OptionItem extends BaseEntity implements IOptionItem {
  readonly name: IMultilingual;

  readonly description: IMultilingual;

  readonly orderRank: number;

  readonly status: Status;

  readonly isOther: boolean;

  readonly isDefault: boolean;

  readonly subitems: IOptionSubItem[];

  constructor(data: IOptionItemData) {
    super(data);
    this.name = data.name;
    this.description = data.description;
    this.orderRank = data.orderRank;
    this.status = data.status;
    this.isOther = data.isOther;
    this.isDefault = data.isDefault;
    this.subitems = _sortBy(data.subitems, 'orderRank');
  }
}
