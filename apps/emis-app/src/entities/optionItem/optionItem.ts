import _cloneDeep from 'lodash/cloneDeep';
import _sortBy from 'lodash/sortBy';
import { IMultilingual } from '@/types';
import { BaseEntity } from '@libs/core-lib/entities/base';
import utils from '@libs/core-lib/entities/utils';
import {
  IOptionItem, IOptionItemData, IOptionSubItem,
} from './optionItem.types';

export class OptionItem extends BaseEntity implements IOptionItem {
  readonly name: IMultilingual;

  readonly description: IMultilingual;

  readonly orderRank: number;

  readonly isOther: boolean;

  readonly isDefault: boolean;

  readonly subitems: IOptionSubItem[];

  constructor(data: IOptionItemData) {
    super(data);
    this.name = utils.initMultilingualAttributes(data.name);
    this.description = utils.initMultilingualAttributes(data.description);
    this.orderRank = data.orderRank;
    this.isOther = data.isOther;
    this.isDefault = data.isDefault;
    this.subitems = _sortBy(_cloneDeep(data.subitems) || [], 'orderRank');
  }
}
