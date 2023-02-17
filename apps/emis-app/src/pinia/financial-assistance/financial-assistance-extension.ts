import { ref, Ref } from 'vue';
import { BaseStoreComponents } from '@libs/stores-lib/base';
import {
  IFinancialAssistanceTablesService,
  IFinancialAssistanceTablesServiceMock,
} from '@libs/services-lib/financial-assistance-tables/entity';
import utils from '@libs/entities-lib/utils';
import {
  IdParams,
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableItem,
  IFinancialAssistanceTableItemData,
  IFinancialAssistanceTableSubItem,
  ICreateFinancialAssistanceTableRequest,
  IFinancialAssistanceTableEntity,
  IEditFinancialAssistanceTableRequest,
} from '@libs/entities-lib/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { IProgramEntity } from '@libs/entities-lib/program';
import { Status } from '@libs/entities-lib/base';
import { IMultilingual } from '@libs/shared-lib/types';
import { mapItem, subItemToSubItemData, itemToItemData, prepareItemsArray } from './financial-assistance-helpers';

// eslint-disable-next-line max-lines-per-function
export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IFinancialAssistanceTableEntity, IdParams>,
  entityService: IFinancialAssistanceTablesService | IFinancialAssistanceTablesServiceMock,
) {
  const id = ref('');
  const name = ref({
    translation: {
      en: '',
      fr: '',
    },
  }) as Ref<IMultilingual>;
  const status = ref(Status.Inactive);
  const program = ref(null) as Ref<IProgramEntity>;
  const mainItems = ref([]) as Ref<IFinancialAssistanceTableItem[]>;
  const dirty = ref(false);
  const formDirty = ref(false);
  const loading = ref(false);
  const addingItem = ref(false);
  const editedItem = ref(null) as Ref<IFinancialAssistanceTableItem>;
  const editedItemIndex = ref(-1);
  const editedSubItemIndex = ref(-1);
  const newItem = ref({
    mainCategory: null as IOptionItem,
    subItems: [] as IFinancialAssistanceTableSubItem[],
  });
  const newSubItem = ref({
    subCategory: null as IOptionSubItem,
    maximumAmount: 0,
    amountType: EFinancialAmountModes.Fixed,
    documentationRequired: false,
    frequency: EFinancialFrequency.OneTime,
  });

  function getName(language: string): string {
    return name.value.translation[language];
  }

  function getSubItems(index: number) {
    return mainItems.value[index].subItems;
  }

  function isOperating():boolean {
    return addingItem.value !== false
    || editedItem.value !== null
    || newItem?.value?.mainCategory !== null
    || newSubItem?.value?.subCategory !== null
    || editedItemIndex.value > -1
    || editedSubItemIndex.value > -1;
  }

  function setName({ newName, language }: { newName: string; language: string }) {
    name.value.translation[language] = newName;
    formDirty.value = true;
  }

  function setItemItem({ item, index }: { item: IOptionItem; index: number }) {
    mainItems.value[index].mainCategory = item;
  }

  function setSubItem({ subItem, index, parentIndex }: { subItem: IFinancialAssistanceTableSubItem; index: number; parentIndex: number }) {
    mainItems.value[parentIndex].subItems[index] = {
      ...subItem,
      maximumAmount: Number(subItem.maximumAmount),
    };
    dirty.value = true;
  }

  function addItem({ item }: { item: IFinancialAssistanceTableItem }) {
    mainItems.value.push(item);
    dirty.value = true;
  }

  function addSubItem({ subItem, index }: { subItem: IFinancialAssistanceTableSubItem; index: number }) {
    mainItems.value[index].subItems.push({
      ...subItem,
      maximumAmount: Number(subItem.maximumAmount),
    });
    dirty.value = true;
  }

  function removeItem({ index }: { index: number }) {
    mainItems.value.splice(index, 1);
    dirty.value = true;
  }

  function removeSubItem({ index, parentIndex }: { index: number; parentIndex: number }) {
    mainItems.value[parentIndex].subItems.splice(index, 1);
    dirty.value = true;
  }

  function resetNewItem() {
    newItem.value = {
      mainCategory: null,
      subItems: [],
    };
  }

  function cancelOperation() {
    addingItem.value = false;
    editedItem.value = null;
    editedItemIndex.value = -1;
    editedSubItemIndex.value = -1;
  }

  function resetNewSubItem() {
    newSubItem.value = {
      subCategory: null,
      maximumAmount: 0,
      amountType: EFinancialAmountModes.Fixed,
      documentationRequired: false,
      frequency: EFinancialFrequency.OneTime,
    };
  }

  function resetExtensionState() {
    id.value = '';
    name.value = {
      translation: {
        en: '',
        fr: '',
      },
    };
    status.value = Status.Inactive;
    program.value = null;
    mainItems.value = [];
    dirty.value = false;
    formDirty.value = false;
    loading.value = false;
    addingItem.value = false;
    editedItem.value = null;
    editedItemIndex.value = -1;
    editedSubItemIndex.value = -1;
    newItem.value = {
      mainCategory: null,
      subItems: [],
    };
    newSubItem.value = {
      subCategory: null,
      maximumAmount: 0,
      amountType: EFinancialAmountModes.Fixed,
      documentationRequired: false,
      frequency: EFinancialFrequency.OneTime,
    };
  }

  function setFinancialAssistance(
    {
      fa, categories, newProgram, removeInactiveItems,
    }: {
      fa: IFinancialAssistanceTableEntity, categories: IOptionItem[], newProgram: IProgramEntity, removeInactiveItems: boolean,
    },
  ) {
    id.value = fa.id;
    program.value = newProgram;
    name.value = fa.name;
    status.value = fa.status;

    // when editing an existing payment
    // or showing one that was submitted already, we need to keep inactive items
    const items = prepareItemsArray(fa.items, removeInactiveItems);
    mainItems.value = items.map((item) => mapItem(item, categories));
  }

  async function createFinancialAssistance({ table }: { table: boolean }): Promise<IFinancialAssistanceTableEntity> {
    const items: IFinancialAssistanceTableItemData[] = mainItems.value.map(itemToItemData);

    const payload = {
      status: status.value,
      eventId: program.value.eventId,
      programId: program.value.id,
      name: utils.getFilledMultilingualField(name.value),
      items,
    } as ICreateFinancialAssistanceTableRequest;

    if (table) {
      const result = await entityService.createFinancialAssistanceTable(payload);

      dirty.value = false;
      formDirty.value = false;
      if (result) {
        baseComponents.addNewlyCreatedId(result);
        baseComponents.set(result);
      }
      return result;
    }
    return null;
  }

  async function editFinancialAssistance(): Promise<IFinancialAssistanceTableEntity> {
    const payload = {
      status: status.value,
      name: utils.getFilledMultilingualField(name.value),
    } as IEditFinancialAssistanceTableRequest;

    const res = await entityService.editFinancialAssistanceTable(id.value, payload);
    dirty.value = false;
    formDirty.value = false;
    return res;
  }

  async function createItem({ item }: { item: IFinancialAssistanceTableItem }): Promise<IFinancialAssistanceTableEntity> {
    const payload = itemToItemData(item);
    const res = await entityService.createItem(id.value, payload);
    return res;
  }

  async function createSubItem({ itemIndex, subItem }: { itemIndex: number; subItem: IFinancialAssistanceTableSubItem })
    : Promise<IFinancialAssistanceTableEntity> {
    const payload = subItemToSubItemData(subItem);
    const itemId = mainItems.value[itemIndex].id;

    const res = await entityService.createSubItem(id.value, itemId, payload);
    return res;
  }

  async function editSubItem(
    { itemIndex, subItemIndex, subItem }: { itemIndex: number; subItemIndex: number; subItem: IFinancialAssistanceTableSubItem },
  ) : Promise<IFinancialAssistanceTableEntity> {
    const payload = subItemToSubItemData(subItem);
    const itemId = mainItems.value[itemIndex].id;
    const subItemId = mainItems.value[itemIndex].subItems[subItemIndex].id;

    const res = await entityService.editSubItem(id.value, itemId, subItemId, payload);
    return res;
  }

  async function deleteSubItem({ itemIndex, subItemIndex }: { itemIndex: number; subItemIndex: number })
    : Promise<IFinancialAssistanceTableEntity> {
    const itemId = mainItems.value[itemIndex].id;
    const subItemId = mainItems.value[itemIndex].subItems[subItemIndex].id;

    const res = await entityService.deleteSubItem(id.value, itemId, subItemId);
    return res;
  }

  async function deleteItem({ itemIndex }: { itemIndex: number }): Promise<IFinancialAssistanceTableEntity> {
    const itemId = mainItems.value[itemIndex].id;

    const res = await entityService.deleteItem(id.value, itemId);
    return res;
  }

  async function reloadItems({ categories }: { categories: IOptionItem[] }): Promise<void> {
    const res: IFinancialAssistanceTableEntity = await baseComponents.fetch(id.value);

    const items = prepareItemsArray(res.items, true);
    const itemEntities: IFinancialAssistanceTableItem[] = items.map((item) => mapItem(item, categories));
    mainItems.value = itemEntities;
    dirty.value = true;
  }

  async function fetchByProgramId({ programId }: { programId: uuid }): Promise<IFinancialAssistanceTableEntity[]> {
    const res: IFinancialAssistanceTableEntity[] = await entityService.fetchByProgramId(programId);
    return res;
  }

  return {
    id,
    name,
    status,
    program,
    mainItems,
    dirty,
    formDirty,
    loading,
    addingItem,
    editedItem,
    editedItemIndex,
    editedSubItemIndex,
    newItem,
    newSubItem,
    isOperating,
    getName,
    getSubItems,
    setName,
    setItemItem,
    setSubItem,
    addItem,
    addSubItem,
    removeItem,
    removeSubItem,
    resetNewItem,
    cancelOperation,
    resetNewSubItem,
    resetExtensionState,
    setFinancialAssistance,
    createFinancialAssistance,
    editFinancialAssistance,
    createItem,
    createSubItem,
    editSubItem,
    deleteSubItem,
    deleteItem,
    reloadItems,
    fetchByProgramId,
  };
}
