import _cloneDeep from 'lodash/cloneDeep';
import _sortBy from 'lodash/sortBy';
import { IMultilingual } from '@libs/shared-lib/types';
import { BaseEntity } from '../base';
import utils from '../utils';
import {
  IOptionItem, IOptionItemData, IOptionSubItem,
} from './optionItem.types';

export class OptionItem extends BaseEntity implements IOptionItem {
  readonly name: IMultilingual;

  readonly description: IMultilingual;

  readonly orderRank: number;

  readonly isOther: boolean;

  readonly isHidden: boolean;

  readonly isDefault: boolean;

  readonly restrictFinancial: boolean;

  readonly isLodging: boolean;

  readonly isOnline: boolean;

  readonly subitems: IOptionSubItem[];

  constructor(data: IOptionItemData) {
    super(data);
    this.name = utils.initMultilingualAttributes(data.name);
    this.description = utils.initMultilingualAttributes(data.description);
    this.orderRank = data.orderRank;
    this.isOther = data.isOther;
    this.isHidden = data.isHidden;
    this.isDefault = data.isDefault;
    this.restrictFinancial = data.restrictFinancial;
    this.isLodging = data.isLodging;
    this.isOnline = data.isOnline;
    this.subitems = _sortBy(_cloneDeep(data.subitems) || [], 'orderRank');
  }
}
