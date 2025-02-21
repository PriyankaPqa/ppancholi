import _sortBy from 'lodash/sortBy';
import {
  IOptionItem, IOptionSubItem, OptionItem,
} from '@libs/entities-lib/optionItem';

import { Status } from '@libs/shared-lib/types';

export function filterAndSortActiveItems(items: IOptionItem[], filterOutInactive = true, actualValue?: string[] | string) {
  if (!items) {
    return [];
  }
  return _sortBy(
    items.map((e) => new OptionItem(e)),
    'orderRank',
  ).filter((i) => !filterOutInactive || (i.status === Status.Active
    || ((Array.isArray(actualValue) && actualValue.indexOf(i.id) > -1) || actualValue === i.id)));
}

export function filterAndSortActiveSubItems(items: IOptionSubItem[], filterOutInactive = true, actualValue?: string[] | string) {
  if (!items) {
    return [];
  }
  return _sortBy(
    items,
    'orderRank',
  ).filter((i) => !filterOutInactive || (i.status === Status.Active
    || ((Array.isArray(actualValue) && actualValue.indexOf(i.id) > -1) || actualValue === i.id)));
}
