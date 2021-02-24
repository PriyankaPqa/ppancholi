import { IMultilingual } from './IMultilingual';
import { EOptionListItemStatus } from '../enums/EOptionListItemStatus';

export interface IOptionListItem {
  id?: string;
  name?: IMultilingual;
  description?: IMultilingual;
  orderRank?: number;
  itemStatus?: EOptionListItemStatus;
  isDefault?: boolean;
  isOther?: boolean;
}
