import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { mockProgramEntity } from '@libs/entities-lib/program';
import { mockFinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { getExtensionComponents } from '@/pinia/financial-assistance/financial-assistance-extension';
import { Status } from '@libs/entities-lib/base';
import {
  IdParams,
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableEntity,
  mockFinancialAssistanceTableEntity,
  mockItemData,
  mockSubItemData,
  mockItems,
  mockSubItems,
  mockCombinedFinancialAssistance,
} from '@libs/entities-lib/financial-assistance';
import { mockOptionItem, mockOptionItems } from '@libs/entities-lib/optionItem';
import { mapItem, subItemToSubItemData, itemToItemData, prepareItemsArray } from './financial-assistance-helpers';

const entity = mockFinancialAssistanceTableEntity();
const mockProgram = mockProgramEntity();
const entityService = mockFinancialAssistanceTablesService();
const baseComponents = getBaseStoreComponents<IFinancialAssistanceTableEntity, IdParams>(entityService);
const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-financial-assistance': {
        id: entity.id,
        name: entity.name,
        status: Status.Active,
        program: mockProgram,
        mainItems: entity.items,
        dirty: false,
        formDirty: false,
        loading: false,
        addingItem: false,
        editedItem: mockItems()[0],
        editedItemIndex: 0,
        editedSubItemIndex: 0,
        newItem: mockItemData(),
        newSubItem: mockSubItemData(),
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useFinancialAssistanceTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useStore = defineStore('test-financial-assistance', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return useFinancialAssistanceTestStore(bComponents);
};

describe('Financial assistance payment store', () => {
  let store = null as ReturnType<typeof createTestStore>;
  let bComponents = {} as Record<string, unknown>;
  beforeEach(() => {
    bComponents = { addNewlyCreatedId: jest.fn(), set: jest.fn(), fetch: jest.fn(() => entity) };
    store = createTestStore({ ...baseComponents, ...bComponents });
  });

  describe('getName', () => {
    it('returns the proper value', () => {
      const name = store.getName('en');
      expect(name).toEqual(entity.name.translation.en);
    });
  });

  describe('getSubItems', () => {
    it('returns the proper value', () => {
      const result = store.getSubItems(1);
      expect(result).toEqual(entity.items[1].subItems);
    });
  });

  describe('isOperating', () => {
    it('returns false if all values are null', () => {
      store.editedItem = null;
      store.newItem.mainCategory = null;
      store.newSubItem.subCategory = null;
      store.editedItemIndex = -1;
      store.editedSubItemIndex = -1;
      store.addingItem = false;
      const result = store.isOperating();
      expect(result).toEqual(false);
    });

    it('returns true if addingItem is true', () => {
      store.editedItem = null;
      store.newItem.mainCategory = null;
      store.newSubItem.subCategory = null;
      store.editedItemIndex = -1;
      store.editedSubItemIndex = -1;
      store.addingItem = true;
      const result = store.isOperating();
      expect(result).toEqual(true);
    });

    it('returns true if editedItem is not null', () => {
      store.editedItem = mockItems()[1];
      store.newItem.mainCategory = null;
      store.newSubItem.subCategory = null;
      store.editedItemIndex = -1;
      store.editedSubItemIndex = -1;
      store.addingItem = false;
      const result = store.isOperating();
      expect(result).toEqual(true);
    });

    it('returns true if new item has a main category', () => {
      store.editedItem = null;
      store.newItem.mainCategory = mockOptionItem();
      store.newSubItem.subCategory = null;
      store.editedItemIndex = -1;
      store.editedSubItemIndex = -1;
      store.addingItem = false;
      const result = store.isOperating();
      expect(result).toEqual(true);
    });
    it('returns true if new sub item has a sub category', () => {
      store.editedItem = null;
      store.newItem.mainCategory = null;
      store.newSubItem.subCategory = mockOptionItem();
      store.editedItemIndex = -1;
      store.editedSubItemIndex = -1;
      store.addingItem = false;
      const result = store.isOperating();
      expect(result).toEqual(true);
    });

    it('returns true if editedItemIndex is larger than -1', () => {
      store.editedItem = null;
      store.newItem.mainCategory = null;
      store.newSubItem.subCategory = null;
      store.editedItemIndex = 0;
      store.editedSubItemIndex = -1;
      store.addingItem = false;
      const result = store.isOperating();
      expect(result).toEqual(true);
    });

    it('returns true if editedSubItemIndex is larger than -1', () => {
      store.editedItem = null;
      store.newItem.mainCategory = null;
      store.newSubItem.subCategory = null;
      store.editedItemIndex = 0;
      store.editedSubItemIndex = -1;
      store.addingItem = false;
      const result = store.isOperating();
      expect(result).toEqual(true);
    });

    it('returns true if editedSubItemIndex is larger than -1', () => {
      store.editedItem = null;
      store.newItem.mainCategory = null;
      store.newSubItem.subCategory = null;
      store.editedItemIndex = 0;
      store.editedSubItemIndex = -1;
      store.addingItem = false;
      const result = store.isOperating();
      expect(result).toEqual(true);
    });
  });

  describe('setName', () => {
    it('sets the right name', () => {
      store.setName({ newName: 'test name', language: 'en' });
      expect(store.name.translation.en).toEqual('test name');
    });
  });

  describe('setItemItem', () => {
    it('sets the setItemItem', () => {
      const { mainCategory } = mockItems()[1];
      store.setItemItem({ item: mainCategory, index: 0 });
      expect(store.mainItems[0].mainCategory).toEqual(mainCategory);
    });
  });

  describe('setSubItem', () => {
    it('sets the setSubItem', () => {
      const subItem = mockSubItems()[1];
      store.dirty = false;
      store.setSubItem({ subItem, index: 1, parentIndex: 1 });
      expect(store.mainItems[1].subItems[1]).toEqual(subItem);
      expect(store.dirty).toBeTruthy();
    });
  });

  describe('addItem', () => {
    it('adds item', () => {
      const item = mockItems()[1];
      store.mainItems = mockItems();
      expect(store.mainItems.length).toBe(2);
      store.addItem({ item });
      expect(store.mainItems.length).toBe(3);
    });
  });

  describe('addSubItem', () => {
    it('sets the addSubItem', () => {
      store.mainItems = mockItems();
      expect(store.mainItems[1].subItems.length).toEqual(1);
      const subItem = mockSubItems()[1];
      store.addSubItem({ subItem, index: 1 });
      expect(store.mainItems[1].subItems.length).toEqual(2);
    });
  });

  describe('removeItem', () => {
    it('removes the item', () => {
      store.mainItems = mockItems();
      expect(store.mainItems.length).toEqual(2);
      store.removeItem({ index: 1 });
      expect(store.mainItems.length).toEqual(1);
    });
  });

  describe('removeSubItem', () => {
    it('removes the subItem', () => {
      store.mainItems = mockItems();
      expect(store.mainItems[0].subItems.length).toEqual(2);
      store.removeSubItem({ index: 0, parentIndex: 0 });
      expect(store.mainItems[0].subItems.length).toEqual(1);
    });
  });

  describe('resetNewItem', () => {
    it('resets the newItem', () => {
      store.resetNewItem();
      expect(store.newItem.mainCategory).toEqual(null);
      expect(store.newItem.subItems).toEqual([]);
    });
  });

  describe('cancelOperation', () => {
    it('resets the related fields', () => {
      store.cancelOperation();
      expect(store.addingItem).toEqual(false);
      expect(store.editedItem).toEqual(null);
      expect(store.editedItemIndex).toEqual(-1);
      expect(store.editedSubItemIndex).toEqual(-1);
    });
  });

  describe('resetNewSubItem', () => {
    it('resets the newSubItem', () => {
      store.resetNewSubItem();

      expect(store.newSubItem.subCategory).toEqual(null);
      expect(store.newSubItem.maximumAmount).toEqual(0);
      expect(store.newSubItem.amountType).toEqual(EFinancialAmountModes.Fixed);
      expect(store.newSubItem.documentationRequired).toEqual(false);
      expect(store.newSubItem.frequency).toEqual(EFinancialFrequency.OneTime);
    });
  });

  describe('resetExtensionState', () => {
    it('resets the state', () => {
      store.resetExtensionState();
      expect(store.id).toEqual('');
      expect(store.name).toEqual({
        translation: {
          en: '',
          fr: '',
        },
      });
      expect(store.program).toEqual(null);
      expect(store.mainItems).toEqual([]);
      expect(store.dirty).toEqual(false);
      expect(store.formDirty).toEqual(false);
      expect(store.loading).toEqual(false);
      expect(store.addingItem).toEqual(false);
      expect(store.editedItem).toEqual(null);
      expect(store.editedItemIndex).toEqual(-1);
      expect(store.editedSubItemIndex).toEqual(-1);
      expect(store.newItem).toEqual({
        mainCategory: null,
        subItems: [],
      });
      expect(store.newSubItem).toEqual({
        subCategory: null,
        maximumAmount: 0,
        amountType: EFinancialAmountModes.Fixed,
        documentationRequired: false,
        frequency: EFinancialFrequency.OneTime,
      });
    });
  });

  describe('setFinancialAssistance', () => {
    it('should set the right values', () => {
      store.setFinancialAssistance({
        fa: mockFinancialAssistanceTableEntity(),
        categories: mockOptionItems(),
        newProgram: mockProgram,
        removeInactiveItems: true,
      });

      expect(store.id).toEqual(mockCombinedFinancialAssistance().entity.id);
      expect(store.program).toEqual(mockProgram);
      expect(store.name).toEqual(mockCombinedFinancialAssistance().entity.name);
      expect(store.status).toEqual(mockCombinedFinancialAssistance().entity.status);
      expect(store.mainItems.length).toEqual(2);
    });
  });

  describe('createFinancialAssistance', () => {
    it('calls the service', async () => {
      store.mainItems = mockItems();
      entityService.createFinancialAssistanceTable = jest.fn(() => entity);

      expect(entityService.createFinancialAssistanceTable).toHaveBeenCalledTimes(0);

      await store.createFinancialAssistance({ table: true });

      expect(bComponents.addNewlyCreatedId).toBeCalledWith(entity);
      expect(bComponents.set).toBeCalledWith(entity);
      expect(entityService.createFinancialAssistanceTable).toHaveBeenCalledTimes(1);
      expect(entityService.createFinancialAssistanceTable).toHaveBeenCalledWith({
        status: store.status,
        eventId: mockProgram.eventId,
        programId: mockProgram.id,
        name: mockFinancialAssistanceTableEntity().name,
        items: store.mainItems.map(itemToItemData),
      });
    });
  });

  describe('editFinancialAssistance', () => {
    it('calls the service', async () => {
      entityService.editFinancialAssistanceTable = jest.fn();
      expect(entityService.editFinancialAssistanceTable).toHaveBeenCalledTimes(0);
      store.id = 'id';
      await store.editFinancialAssistance();
      expect(entityService.editFinancialAssistanceTable).toHaveBeenCalledTimes(1);
      expect(entityService.editFinancialAssistanceTable).toHaveBeenCalledWith('id', {
        status: store.status,
        name: mockFinancialAssistanceTableEntity().name,
      });
    });
  });

  describe('createItem', () => {
    it('calls the service', async () => {
      entityService.createItem = jest.fn();
      expect(entityService.createItem).toHaveBeenCalledTimes(0);

      const item = mockItems()[0];
      store.id = 'faId';

      await store.createItem({ item });
      expect(entityService.createItem).toHaveBeenCalledTimes(1);
      expect(entityService.createItem).toHaveBeenCalledWith('faId', itemToItemData(item));
    });
  });

  describe('createSubItem', () => {
    it('calls the service', async () => {
      entityService.createSubItem = jest.fn();
      expect(entityService.createSubItem).toHaveBeenCalledTimes(0);

      const mainItems = mockItems();
      const itemIndex = 0;
      const subItem = mockSubItems()[0];

      store.id = 'faId';
      store.mainItems = mainItems;

      await store.createSubItem({ itemIndex, subItem });
      expect(entityService.createSubItem).toHaveBeenCalledTimes(1);
      expect(entityService.createSubItem).toHaveBeenCalledWith('faId', mainItems[itemIndex].id, subItemToSubItemData(subItem));
    });
  });

  describe('editSubItem', () => {
    it('calls the service', async () => {
      entityService.editSubItem = jest.fn();
      expect(entityService.editSubItem).toHaveBeenCalledTimes(0);

      const mainItems = mockItems();
      const faId = 'faId';
      const itemIndex = 0;
      const subItemIndex = 0;
      const subItem = mockSubItems()[0];
      store.id = faId;
      store.mainItems = mainItems;

      await store.editSubItem({ itemIndex, subItemIndex, subItem });

      expect(entityService.editSubItem).toHaveBeenCalledTimes(1);
      expect(entityService.editSubItem).toHaveBeenCalledWith(faId, mainItems[itemIndex].id, mainItems[itemIndex].subItems[subItemIndex].id, subItemToSubItemData(subItem));
    });
  });

  describe('deleteSubItem', () => {
    it('calls the service', async () => {
      entityService.deleteSubItem = jest.fn();
      expect(entityService.deleteSubItem).toHaveBeenCalledTimes(0);

      const mainItems = mockItems();
      const faId = 'faId';

      const itemIndex = 0;
      const subItemIndex = 0;
      store.id = faId;
      store.mainItems = mainItems;

      await store.deleteSubItem({ itemIndex, subItemIndex });
      expect(entityService.deleteSubItem).toHaveBeenCalledTimes(1);
      expect(entityService.deleteSubItem).toHaveBeenCalledWith(faId, mainItems[itemIndex].id, mainItems[itemIndex].subItems[subItemIndex].id);
    });
  });

  describe('deleteItem', () => {
    it('calls the service', async () => {
      entityService.deleteItem = jest.fn();

      expect(entityService.deleteItem).toHaveBeenCalledTimes(0);

      const mainItems = mockItems();
      const faId = 'faId';
      const itemIndex = 0;
      store.id = faId;
      store.mainItems = mainItems;

      await store.deleteItem({ itemIndex });
      expect(entityService.deleteItem).toHaveBeenCalledTimes(1);
      expect(entityService.deleteItem).toHaveBeenCalledWith(faId, mainItems[itemIndex].id);
    });
  });

  describe('reloadItems', () => {
    it('calls the service, helpers and sets the data in the store', async () => {
      store.id = 'faId';
      await store.reloadItems({ categories: [] });
      expect(bComponents.fetch).toHaveBeenCalledWith('faId');

      expect(store.mainItems).toEqual((prepareItemsArray(entity.items, true).map((item) => mapItem(item, []))));
      expect(store.dirty).toBeTruthy();
    });
  });

  describe('fetchByProgramId', () => {
    it('calls the service with proper parameters', async () => {
      entityService.fetchByProgramId = jest.fn();
      expect(entityService.fetchByProgramId).toHaveBeenCalledTimes(0);
      await store.fetchByProgramId({ programId: 'programId' });
      expect(entityService.fetchByProgramId).toHaveBeenCalledTimes(1);
      expect(entityService.fetchByProgramId).toHaveBeenCalledWith('programId');
    });
  });
});
