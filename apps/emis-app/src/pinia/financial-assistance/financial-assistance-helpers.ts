import {
  IFinancialAssistanceTableItem,
  IFinancialAssistanceTableItemData,
  IFinancialAssistanceTableSubItem,
  IFinancialAssistanceTableSubItemData,
} from '@libs/entities-lib/financial-assistance';
import { cloneDeep, orderBy } from 'lodash';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/shared-lib/types';

export function mapItem(item: IFinancialAssistanceTableItemData, categories: IOptionItem[]): IFinancialAssistanceTableItem {
    const mainCategory = categories.find((category) => category.id === item.mainCategory.optionItemId);

    return {
      id: item.id,
      status: item.status,
      mainCategory,
      subItems: item.subItems.map((subItem) => ({
        id: subItem.id,
        subCategory: subItem.subCategory
          ? mainCategory?.subitems.find((subitem) => subitem.id === subItem.subCategory.optionItemId)
          : (({
            id: '-1',
            name: {
              translation: {
                en: 'Default',
                fr: 'Défaut',
              },
            },
          } as unknown) as IOptionSubItem),
        maximumAmount: subItem.maximumAmount,
        amountType: subItem.amountType,
        documentationRequired: subItem.documentationRequired,
        frequency: subItem.frequency,
        status: subItem.status,
      })),
    };
  }

  export function subItemToSubItemData(sub: IFinancialAssistanceTableSubItem): IFinancialAssistanceTableSubItemData {
    return {
      id: sub.id,
      subCategory:
      sub.subCategory.id === '-1'
        ? null
        : {
          optionItemId: sub.subCategory.id,
          specifiedOther: null,
        },
      maximumAmount: sub.maximumAmount,
      amountType: sub.amountType,
      documentationRequired: sub.documentationRequired,
      frequency: sub.frequency,
    };
  }

  export function itemToItemData(item: IFinancialAssistanceTableItem): IFinancialAssistanceTableItemData {
    return {
      id: item.id,
      mainCategory: {
        optionItemId: item.mainCategory.id,
        specifiedOther: null,
      },
      subItems: item.subItems?.map(subItemToSubItemData),
    };
  }

  // sorts items and subitems, plus can remove inactive items if required
  export function prepareItemsArray(items: IFinancialAssistanceTableItemData[], excludeDeleted: boolean): IFinancialAssistanceTableItemData[] {
    const itemsCopy = cloneDeep(items);

    const results = orderBy(itemsCopy.filter((item) => {
      if (item.status === Status.Inactive && excludeDeleted) {
        return false;
      }

      item.subItems = orderBy(item.subItems.filter((subItem) => subItem.status === Status.Active || !excludeDeleted), 'status');

      return true;
    }), 'status');

    return results;
  }
