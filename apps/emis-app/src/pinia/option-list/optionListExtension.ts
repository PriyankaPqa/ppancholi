import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';
import { Ref, ref } from 'vue';
import {
 EOptionLists, ICreateOptionItemRequest, IOptionItem, IOptionSubItem, OptionItem,
} from '@libs/entities-lib/optionItem';
import { Status, IMultilingual } from '@libs/shared-lib/types';
import _sortBy from 'lodash/sortBy';
import _findIndex from 'lodash/findIndex';
import helpers from '@/ui/helpers/helpers';

// eslint-disable-next-line max-lines-per-function
export function getExtensionComponents(
  optionItemService: OptionItemsService | IOptionItemsServiceMock,
) {
  const items = ref([]) as Ref<IOptionItem[]>;
  const list = ref(null) as Ref<EOptionLists>;

  function getItems() {
    return items.value ? _sortBy(items.value.map((e) => new OptionItem(e)), 'orderRank') : [];
  }

  function addOrUpdateItem(data: IOptionItem) {
    const index = _findIndex(items.value, { id: data.id });

    if (index > -1) {
      items.value = [
        ...items.value.slice(0, index),
        data,
        ...items.value.slice(index + 1),
      ];
    } else {
      items.value.push(data);
    }
  }

  function resetState() {
    items.value = [];
    list.value = null;
  }

  async function fetchItems(): Promise<IOptionItem[]> {
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.getOptionList(list.value);

    items.value = data;
    return getItems();
  }

  async function fetchSubItems(): Promise<IOptionSubItem[]> {
    if (!list.value) {
      throw new Error('You must set a value for list');
    }
    const parentData: IOptionItem[] = await optionItemService.getOptionList(list.value);
    let data: IOptionSubItem[] = [];

    if (parentData) {
      parentData.forEach((element) => {
        element.subitems.forEach((subItem) => data.push(subItem));
      });
      data = helpers.sortMultilingualArray(data, 'name', true); // Trim
    }
    return data;
  }

  async function createOption(payload: ICreateOptionItemRequest): Promise<IOptionItem> {
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.createOptionItem(list.value, payload);

    if (data != null) {
      addOrUpdateItem(data);
    }

    return null;
  }

  async function addSubItem(itemId: string, subItem: ICreateOptionItemRequest): Promise<IOptionItem> {
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.addSubItem(list.value, itemId, subItem);

    if (data != null) {
      addOrUpdateItem(data);
    }

    return null;
  }

  async function updateItem(payload: { id: string, name: IMultilingual, description: IMultilingual }): Promise<IOptionItem> {
    const { id, name, description } = payload;
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.updateOptionItem(list.value, id, name, description);

    if (data != null) {
      addOrUpdateItem(data);
    }

    return null;
  }

  async function updateSubItem(payload: { itemId: string, subItemId: string, name: IMultilingual, description: IMultilingual }): Promise<IOptionItem> {
    const {
      itemId, subItemId, name, description,
    } = payload;
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.updateOptionSubItem(list.value, itemId, subItemId, name, description);

    if (data != null) {
      addOrUpdateItem(data);
    }

    return null;
  }

  async function updateStatus(payload: { id: string, status: Status }): Promise<IOptionItem> {
    const { id, status } = payload;
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.updateOptionItemStatus(list.value, id, status);

    if (data != null) {
      addOrUpdateItem(data);
    }

    return null;
  }

  async function updateSubItemStatus(payload: { itemId: string, subItemId: string, status: Status }): Promise<IOptionItem> {
    const { itemId, subItemId, status } = payload;
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.updateOptionSubItemStatus(list.value, itemId, subItemId, status);

    if (data != null) {
      addOrUpdateItem(data);
    }

    return null;
  }

  async function updateOrderRanks(payload: Array<IOptionItem>): Promise<IOptionItem[]> {
    if (!list.value) {
      throw new Error('You must set a value for list');
    }
    const orderRanks: Record<string, number> = {};

    const originalOrder = _sortBy([...items.value], 'orderRank');

    const newOrderedItems = payload.map((i, index) => {
      const oldItem = originalOrder[index];

      const newRank = oldItem.orderRank;

      return {
        ...i,
        orderRank: newRank,
      };
    });

    items.value = newOrderedItems;

    newOrderedItems.forEach((i) => {
      orderRanks[i.id] = i.orderRank;
    });

    try {
      const data = await optionItemService.updateOptionItemOrderRanks(list.value, orderRanks);
      return data;
    } catch (e) {
      items.value = originalOrder;
      throw e;
    }
  }

  async function updateSubItemOrderRanks(newItem: IOptionItem): Promise<IOptionItem[]> {
    if (!list.value) {
      throw new Error('You must set a value for list');
    }
    const originalItem = items.value.find((i) => i.id === newItem.id);

    const updatedItem = {
      ...newItem,
      subitems: newItem.subitems.map((sub, index) => ({
        ...sub,
        orderRank: index + 1,
      })),
    };

    addOrUpdateItem(updatedItem);

    const params: Record<string, number> = {};
    updatedItem.subitems.forEach((sub, index) => {
      params[sub.id] = index + 1;
    });

    try {
      const data = await optionItemService.updateOptionSubItemOrderRanks(list.value, newItem.id, params);

      return data;
    } catch (e) {
      addOrUpdateItem(originalItem);
      throw e;
    }
  }

  async function setIsOther(payload: { id: string, isOther: boolean }): Promise<IOptionItem> {
    const { id, isOther } = payload;
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.setOptionItemIsOther(list.value, id, isOther);

    if (data != null) {
      // Unset the isOther value from all the items

      items.value = items.value.map((i) => ({
        ...i,
        isOther: false,
      }));

      // Update the modified item in the state

      addOrUpdateItem(data);

      return data;
    }

    return null;
  }

  async function setSubItemIsOther(payload: { itemId: string, subItemId: string, isOther: boolean }): Promise<IOptionItem> {
    const { itemId, subItemId, isOther } = payload;
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.setOptionSubItemIsOther(list.value, itemId, subItemId, isOther);

    if (data != null) {
      addOrUpdateItem(data);

      return data;
    }

    return null;
  }

  async function setIsDefault(payload: { id: string, isDefault: boolean }): Promise<IOptionItem> {
    const { id, isDefault } = payload;
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.setOptionItemIsDefault(list.value, id, isDefault);

    if (data != null) {
      // Unset the isDefault value from all the items

      items.value = items.value.map((i) => ({
        ...i,
        isDefault: false,
      }));
      // Update the modified item in the state
      addOrUpdateItem(data);

      return data;
    }

    return null;
  }

  async function setRestrictFinancial(payload: { id: string, restrictFinancial: boolean }): Promise<IOptionItem> {
    const { id, restrictFinancial } = payload;
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.setOptionItemRestrictFinancial(list.value, id, restrictFinancial);

    if (data != null) {
      // Must not unset the restrictFinancial value from all the items because we allow multiple items to have restrictFinancial set

      // Update the modified item in the state
      addOrUpdateItem(data);

      return data;
    }

    return null;
  }

  async function setLodging(payload: { id: string, isLodging: boolean }): Promise<IOptionItem> {
    const { id, isLodging } = payload;
    if (!list.value) {
      throw new Error('You must set a value for list');
    }

    const data = await optionItemService.setOptionItemLodging(list.value, id, isLodging);

    if (data != null) {
      // Unset the Lodging value from all the items

      items.value = items.value.map((i) => ({
        ...i,
        isLodging: false,
      }));
      // Update the modified item in the state
      addOrUpdateItem(data);

      return data;
    }

    return null;
  }

  return {
    items,
    list,
    getItems,
    addOrUpdateItem,
    resetState,
    fetchItems,
    fetchSubItems,
    createOption,
    addSubItem,
    updateItem,
    updateSubItem,
    updateStatus,
    updateSubItemStatus,
    updateOrderRanks,
    updateSubItemOrderRanks,
    setIsOther,
    setSubItemIsOther,
    setIsDefault,
    setLodging,
    setRestrictFinancial,
  };
}
