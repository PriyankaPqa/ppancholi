import { FINANCIAL_ASSISTANCE_ENTITIES, FINANCIAL_ASSISTANCE_METADATA } from '@/constants/vuex-modules';
import { Status } from '@/entities/base';
import {
  EFinancialAmountModes,
  EFinancialFrequency,
  mockFinancialAssistanceTableEntity,
  mockItems,
  mockSubItems,
} from '@/entities/financial-assistance';
import { mockProgramsSearchData, Program } from '@/entities/program';
import { mockStore } from '@/store';
import { FinancialAssistanceStorage } from './storage';

const entityModuleName = FINANCIAL_ASSISTANCE_ENTITIES;
const metadataModuleName = FINANCIAL_ASSISTANCE_METADATA;

const store = mockStore({}, { commit: true, dispatch: true });
const storage = new FinancialAssistanceStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Financial Assistance Storage', () => {
  describe('>> Getters', () => {
    it('should proxy name', () => {
      expect(storage.getters.name('en')).toEqual(store.getters[`${entityModuleName}/name`]('en'));
    });

    it('should proxy status', () => {
      expect(storage.getters.status()).toEqual(store.getters[`${entityModuleName}/status`]);
    });

    it('should proxy addingItem', () => {
      expect(storage.getters.addingItem()).toEqual(store.getters[`${entityModuleName}/addingItem`]);
    });

    it('should proxy program', () => {
      expect(storage.getters.program()).toEqual(store.getters[`${entityModuleName}/program`]);
    });

    it('should proxy items', () => {
      expect(storage.getters.items()).toEqual(store.getters[`${entityModuleName}/items`]);
    });

    it('should proxy subItems', () => {
      expect(storage.getters.subItems()).toEqual(store.getters[`${entityModuleName}/subItems`]);
    });

    it('should proxy newItem', () => {
      expect(storage.getters.newItem()).toEqual(store.getters[`${entityModuleName}/newItem`]);
    });

    it('should proxy editedItem', () => {
      expect(storage.getters.editedItem()).toEqual(store.getters[`${entityModuleName}/editedItem`]);
    });

    it('should proxy editedItemIndex', () => {
      expect(storage.getters.editedItemIndex()).toEqual(store.getters[`${entityModuleName}/editedItemIndex`]);
    });

    it('should proxy editedSubItemIndex', () => {
      expect(storage.getters.editedSubItemIndex()).toEqual(store.getters[`${entityModuleName}/editedSubItemIndex`]);
    });

    it('should proxy newSubItem', () => {
      expect(storage.getters.newSubItem()).toEqual(store.getters[`${entityModuleName}/newSubItem`]);
    });

    it('should proxy dirty', () => {
      expect(storage.getters.dirty()).toEqual(store.getters[`${entityModuleName}/dirty`]);
    });

    it('should proxy formDirty', () => {
      expect(storage.getters.formDirty()).toEqual(store.getters[`${entityModuleName}/formDirty`]);
    });

    it('should proxy loading', () => {
      expect(storage.getters.loading()).toEqual(store.getters[`${entityModuleName}/loading`]);
    });

    it('should proxy isOperating', () => {
      expect(storage.getters.isOperating()).toEqual(store.getters[`${entityModuleName}/isOperating`]);
    });
  });

  // eslint-disable-next-line
  describe('>> Mutations', () => {
    it('should proxy setId', () => {
      storage.mutations.setId('id');
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setId`, { id: 'id' });
    });

    it('should proxy setName', () => {
      const name = 'name';
      const language = 'en';

      storage.mutations.setName(name, language);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setName`, { name, language });
    });

    it('should proxy setNameInAllLanguages', () => {
      const { name } = mockFinancialAssistanceTableEntity();

      storage.mutations.setNameInAllLanguages(name);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setNameInAllLanguages`, { name });
    });

    it('should proxy setStatus', () => {
      const status = Status.Active;

      storage.mutations.setStatus(status);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setStatus`, { status });
    });

    it('should proxy setAddingItem', () => {
      const addingItem = true;

      storage.mutations.setAddingItem(addingItem);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setAddingItem`, { addingItem });
    });

    it('should proxy setProgram', () => {
      const program = new Program(mockProgramsSearchData()[0]);

      storage.mutations.setProgram(program);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setProgram`, { program });
    });

    it('should proxy setItems', () => {
      const items = mockItems();

      storage.mutations.setItems(items);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setItems`, { items });
    });

    it('should proxy setItem', () => {
      const item = mockItems()[0];
      const index = 1;

      storage.mutations.setItem(item, index);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setItem`, { item, index });
    });

    it('should proxy setItemItem', () => {
      const { mainCategory: item } = mockItems()[0];
      const index = 1;

      storage.mutations.setItemItem(item, index);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setItemItem`, { item, index });
    });

    it('should proxy setSubItem', () => {
      const subItem = mockSubItems()[0];
      const index = 1;
      const parentIndex = 0;

      storage.mutations.setSubItem(subItem, index, parentIndex);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setSubItem`, { subItem, index, parentIndex });
    });

    it('should proxy setSubItemSubItem', () => {
      const { subCategory: subItem } = mockSubItems()[0];
      const index = 1;
      const parentIndex = 0;

      storage.mutations.setSubItemSubItem(subItem, index, parentIndex);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setSubItemSubItem`, { subItem, index, parentIndex });
    });

    it('should proxy setSubItemMaximum', () => {
      const maximum = 7;
      const index = 1;
      const parentIndex = 0;

      storage.mutations.setSubItemMaximum(maximum, index, parentIndex);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setSubItemMaximum`, { maximum, index, parentIndex });
    });

    it('should proxy setSubItemAmountType', () => {
      const amountType = EFinancialAmountModes.Fixed;
      const index = 1;
      const parentIndex = 0;

      storage.mutations.setSubItemAmountType(amountType, index, parentIndex);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setSubItemAmountType`, { amountType, index, parentIndex });
    });

    it('should proxy setSubItemDocumentationRequired', () => {
      const documentationRequired = true;
      const index = 1;
      const parentIndex = 0;

      storage.mutations.setSubItemDocumentationRequired(documentationRequired, index, parentIndex);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setSubItemDocumentationRequired`, {
        documentationRequired,
        index,
        parentIndex,
      });
    });

    it('should proxy setSubItemFrequency', () => {
      const frequency = EFinancialFrequency.Multiple;
      const index = 1;
      const parentIndex = 0;

      storage.mutations.setSubItemFrequency(frequency, index, parentIndex);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setSubItemFrequency`, { frequency, index, parentIndex });
    });

    it('should proxy setNewItemItem', () => {
      const { mainCategory: item } = mockItems()[0];

      storage.mutations.setNewItemItem(item);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setNewItemItem`, { item });
    });

    it('should proxy setNewSubItem', () => {
      const newSubItem = mockSubItems()[0];

      storage.mutations.setNewSubItem(newSubItem);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setNewSubItem`, { newSubItem });
    });

    it('should proxy setNewSubItemSubItem', () => {
      const { subCategory: subItem } = mockSubItems()[0];

      storage.mutations.setNewSubItemSubItem(subItem);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setNewSubItemSubItem`, { subItem });
    });

    it('should proxy setNewSubItemMaximum', () => {
      const maximum = 7;

      storage.mutations.setNewSubItemMaximum(maximum);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setNewSubItemMaximum`, { maximum });
    });

    it('should proxy setNewSubItemAmountType', () => {
      const amountType = EFinancialAmountModes.Fixed;

      storage.mutations.setNewSubItemAmountType(amountType);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setNewSubItemAmountType`, { amountType });
    });

    it('should proxy setNewSubItemDocumentationRequired', () => {
      const documentationRequired = true;

      storage.mutations.setNewSubItemDocumentationRequired(documentationRequired);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setNewSubItemDocumentationRequired`, { documentationRequired });
    });

    it('should proxy setNewSubItemFrequency', () => {
      const frequency = EFinancialFrequency.Multiple;

      storage.mutations.setNewSubItemFrequency(frequency);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setNewSubItemFrequency`, { frequency });
    });

    it('should proxy addItem', () => {
      const item = mockItems()[0];

      storage.mutations.addItem(item);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/addItem`, { item });
    });

    it('should proxy addSubItem', () => {
      const subItem = mockSubItems()[0];
      const index = 1;

      storage.mutations.addSubItem(subItem, index);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/addSubItem`, { subItem, index });
    });

    it('should proxy setItemSubItems', () => {
      const subItems = mockSubItems();
      const index = 1;

      storage.mutations.setItemSubItems(index, subItems);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setItemSubItems`, { index, subItems });
    });

    it('should proxy setEditedItem', () => {
      const editedItem = mockItems()[0];

      storage.mutations.setEditedItem(editedItem);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setEditedItem`, { editedItem });
    });

    it('should proxy setEditedItemIndex', () => {
      const editedItemIndex = 2;

      storage.mutations.setEditedItemIndex(editedItemIndex);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setEditedItemIndex`, { editedItemIndex });
    });

    it('should proxy setEditedSubItemIndex', () => {
      const editedSubItemIndex = 2;

      storage.mutations.setEditedSubItemIndex(editedSubItemIndex);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setEditedSubItemIndex`, { editedSubItemIndex });
    });

    it('should proxy deleteItem', () => {
      const index = 2;

      storage.mutations.deleteItem(index);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/deleteItem`, { index });
    });

    it('should proxy deleteSubItem', () => {
      const index = 2;
      const parentIndex = 3;

      storage.mutations.deleteSubItem(index, parentIndex);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/deleteSubItem`, { index, parentIndex });
    });

    it('should proxy setDirty', () => {
      const dirty = true;

      storage.mutations.setDirty(dirty);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setDirty`, { dirty });
    });

    it('should proxy setFormDirty', () => {
      const formDirty = true;

      storage.mutations.setFormDirty(formDirty);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setFormDirty`, { formDirty });
    });

    it('should proxy setLoading', () => {
      const loading = true;

      storage.mutations.setLoading(loading);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setLoading`, { loading });
    });

    it('should proxy resetNewItem', () => {
      storage.mutations.resetNewItem();
      expect(store.commit).toBeCalledWith(`${entityModuleName}/resetNewItem`);
    });

    it('should proxy resetNewSubItem', () => {
      storage.mutations.resetNewSubItem();
      expect(store.commit).toBeCalledWith(`${entityModuleName}/resetNewSubItem`);
    });

    it('should proxy resetState', () => {
      storage.mutations.resetState();
      expect(store.commit).toBeCalledWith(`${entityModuleName}/resetState`);
    });

    it('should proxy cancelOperation', () => {
      storage.mutations.cancelOperation();
      expect(store.commit).toBeCalledWith(`${entityModuleName}/cancelOperation`);
    });
  });

  describe('>> Actions', () => {
    it('should proxy createFinancialAssistance', () => {
      storage.actions.createFinancialAssistance(true);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/createFinancialAssistance`, { table: true });
    });

    it('should proxy fetchActiveCategories', () => {
      storage.actions.fetchActiveCategories();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchActiveCategories`);
    });
  });
});
