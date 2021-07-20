import { ActionContext } from 'vuex';
import {
  EFinancialAmountModes,
  EFinancialFrequency,
  mockFinancialAssistanceTableEntity,
  mockItems,
  mockSubItems,
} from '@/entities/financial-assistance';
import { mockProgramsSearchData, Program } from '@/entities/program';
import { FinancialAssistanceTablesService } from '@/services/financial-assistance-tables/entity';
import { httpClient } from '@/services/httpClient';
import { IMultilingual } from '@/types';
import { Status } from '@/entities/base';
import { FinancialAssistanceEntityModule } from './financialAssistanceEntity';

import { IFinancialAssistanceEntityState } from './financialAssistanceEntity.types';

const service = new FinancialAssistanceTablesService(httpClient);
let module: FinancialAssistanceEntityModule;

const mockProgram = new Program(mockProgramsSearchData()[0]);
const mockState: IFinancialAssistanceEntityState = {
  id: '',
  items: [],
  name: mockFinancialAssistanceTableEntity().name,
  status: Status.Inactive,
  program: mockProgram,
  mainItems: mockItems(),
  dirty: false,
  formDirty: false,
  loading: false,
  addingItem: false,
  editedItem: mockItems()[0],
  editedItemIndex: -1,
  editedSubItemIndex: -1,
  newItem: mockItems()[1],
  newSubItem: mockSubItems()[1],
  searchLoading: false,
};

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: mockState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>;

describe('>>> Financial Assistance Module', () => {
  beforeEach(() => {
    module = new FinancialAssistanceEntityModule(service);
  });

  describe('>> Getters', () => {
    describe('name', () => {
      it('returns the name', () => {
        module.mutations.setName(module.state, { name: 'new name', language: 'en' });

        expect(module.getters.name(module.state)('en')).toEqual('new name');
      });
    });

    describe('status', () => {
      it('returns the status', () => {
        module.mutations.setStatus(module.state, { status: Status.Active });

        expect(module.getters.status(module.state)).toEqual(Status.Active);
      });
    });

    describe('addingItem', () => {
      it('returns the addingItem', () => {
        module.mutations.setAddingItem(module.state, { addingItem: false });

        expect(module.getters.addingItem(module.state)).toEqual(false);
      });
    });

    describe('program', () => {
      it('returns the program', () => {
        module.mutations.setProgram(module.state, { program: mockProgram });

        expect(module.getters.program(module.state)).toEqual(mockProgram);
      });
    });

    describe('items', () => {
      it('returns the items', () => {
        module.mutations.setItems(module.state, { items: mockItems() });

        expect(module.getters.items(module.state)).toEqual(mockItems());
      });
    });

    describe('newItem', () => {
      it('returns the newItem', () => {
        expect(module.getters.newItem(module.state)).toEqual({
          mainCategory: null,
          subRows: [],
        });
      });
    });

    describe('newSubItem', () => {
      it('returns the newSubItem', () => {
        expect(module.getters.newSubItem(module.state)).toEqual({
          subCategory: null,
          maximumAmount: 0,
          amountType: EFinancialAmountModes.Fixed,
          documentationRequired: false,
          frequency: EFinancialFrequency.OneTime,
        });
      });
    });

    describe('editedItem', () => {
      it('returns the editedItem', () => {
        module.mutations.setEditedItem(module.state, { editedItem: mockItems()[0] });

        expect(module.getters.editedItem(module.state)).toEqual(mockItems()[0]);
      });
    });

    describe('editedItemIndex', () => {
      it('returns the editedItemIndex', () => {
        module.mutations.setEditedItemIndex(module.state, { editedItemIndex: -1 });

        expect(module.getters.editedSubItemIndex(module.state)).toEqual(-1);
      });
    });

    describe('subItems', () => {
      it('returns the subItems', () => {
        module.mutations.setItems(module.state, { items: mockItems() });

        expect(module.getters.subItems(module.state)(0)).toEqual(mockItems()[0].subRows);
      });
    });

    describe('dirty', () => {
      it('returns the dirty', () => {
        module.mutations.setDirty(module.state, { dirty: false });

        expect(module.getters.dirty(module.state)).toEqual(false);
      });
    });

    describe('formDirty', () => {
      it('returns the formDirty', () => {
        module.mutations.setFormDirty(module.state, { formDirty: false });

        expect(module.getters.formDirty(module.state)).toEqual(false);
      });
    });

    describe('loading', () => {
      it('returns the loading', () => {
        module.mutations.setLoading(module.state, { loading: false });

        expect(module.getters.loading(module.state)).toEqual(false);
      });
    });

    describe('isOperating', () => {
      it('returns the isOperating', () => {
        expect(module.getters.isOperating(module.state)).toEqual(false);

        module.state.addingItem = true;

        expect(module.getters.isOperating(module.state)).toEqual(true);
      });
    });
  });

  // eslint-disable-next-line
  describe('>> Mutations', () => {
    describe('setId', () => {
      it('sets the id', () => {
        module.mutations.setId(module.state, { id: 'test id' });

        expect(module.state.id).toBe('test id');
      });
    });

    describe('setName', () => {
      it('sets the name', () => {
        module.mutations.setName(module.state, { name: 'test name', language: 'en' });

        expect(module.state.name.translation.en).toBe('test name');
      });
    });

    describe('setNameInAllLanguages', () => {
      it('sets the  in all languages', () => {
        const newName: IMultilingual = {
          translation: {
            en: 'name en',
            fr: 'name fr',
          },
        };

        module.mutations.setNameInAllLanguages(module.state, { name: newName });

        expect(module.state.name).toEqual(newName);
      });
    });

    describe('setStatus', () => {
      it('sets the name', () => {
        module.mutations.setStatus(module.state, { status: Status.Active });

        expect(module.state.status).toEqual(Status.Active);
      });
    });

    describe('setAddingItem', () => {
      it('sets the setAddingItem', () => {
        module.mutations.setAddingItem(module.state, { addingItem: true });

        expect(module.state.addingItem).toEqual(true);
      });
    });

    describe('setProgram', () => {
      it('sets the setProgram', () => {
        const program = new Program(mockProgramsSearchData()[1]);

        module.mutations.setProgram(module.state, { program });

        expect(module.state.program).toEqual(program);
      });
    });

    describe('setItems', () => {
      it('sets the setItems', () => {
        module.mutations.setItems(module.state, { items: mockItems() });

        expect(module.state.mainItems).toEqual(mockItems());
      });
    });

    describe('setNewItemItem', () => {
      it('sets the setNewItemItem', () => {
        const item = mockItems()[1];

        module.mutations.setNewItemItem(module.state, { item: item.mainCategory });

        expect(module.state.newItem.mainCategory).toEqual(item.mainCategory);
      });
    });

    describe('setNewSubItemSubItem', () => {
      it('sets the setNewSubItemSubItem', () => {
        const subItem = mockItems()[0].mainCategory.subitems[0];

        module.mutations.setNewSubItemSubItem(module.state, { subItem });

        expect(module.state.newSubItem.subCategory).toEqual(subItem);
      });
    });

    describe('setNewSubItemMaximum', () => {
      it('sets the setNewSubItemMaximum', () => {
        module.mutations.setNewSubItemMaximum(module.state, { maximum: 9 });

        expect(module.state.newSubItem.maximumAmount).toEqual(9);
      });
    });

    describe('setNewSubItemAmountType', () => {
      it('sets the setNewSubItemAmountType', () => {
        module.mutations.setNewSubItemAmountType(module.state, { amountType: EFinancialAmountModes.Fixed });

        expect(module.state.newSubItem.amountType).toEqual(EFinancialAmountModes.Fixed);
      });
    });

    describe('setNewSubItemDocumentationRequired', () => {
      it('sets the setNewSubItemDocumentationRequired', () => {
        module.mutations.setNewSubItemDocumentationRequired(module.state, { documentationRequired: true });

        expect(module.state.newSubItem.documentationRequired).toEqual(true);
      });
    });

    describe('setNewSubItemFrequency', () => {
      it('sets the setNewSubItemFrequency', () => {
        module.mutations.setNewSubItemFrequency(module.state, { frequency: EFinancialFrequency.Multiple });

        expect(module.state.newSubItem.frequency).toEqual(EFinancialFrequency.Multiple);
      });
    });

    describe('setItem', () => {
      it('sets the setItem', () => {
        const item = mockItems()[2];

        module.mutations.setItem(module.state, { item, index: 1 });

        expect(module.state.mainItems[1]).toEqual(item);
      });
    });

    describe('setItemItem', () => {
      it('sets the setItemItem', () => {
        const { mainCategory } = mockItems()[1];

        module.state.mainItems = mockItems();

        module.mutations.setItemItem(module.state, { item: mainCategory, index: 0 });

        expect(module.state.mainItems[0].mainCategory).toEqual(mainCategory);
      });
    });

    describe('setSubItem', () => {
      it('sets the setSubItem', () => {
        const subItem = mockSubItems()[1];

        module.state.mainItems = mockItems();

        module.mutations.setSubItem(module.state, { subItem, index: 1, parentIndex: 1 });

        expect(module.state.mainItems[1].subRows[1]).toEqual(subItem);
      });
    });

    describe('setSubItemSubItem', () => {
      it('sets the setSubItemSubItem', () => {
        const { subCategory } = mockSubItems()[1];

        module.state.mainItems = mockItems();

        module.mutations.setSubItemSubItem(module.state, { subItem: subCategory, index: 1, parentIndex: 0 });

        expect(module.state.mainItems[0].subRows[1].subCategory).toEqual(subCategory);
      });
    });

    describe('setSubItemMaximum', () => {
      it('sets the setSubItemMaximum', () => {
        module.state.mainItems = mockItems();

        module.mutations.setSubItemMaximum(module.state, { maximum: 8, index: 1, parentIndex: 0 });

        expect(module.state.mainItems[0].subRows[1].maximumAmount).toEqual(8);
      });
    });

    describe('setSubItemAmountType', () => {
      it('sets the setSubItemAmountType', () => {
        module.state.mainItems = mockItems();

        module.mutations.setSubItemAmountType(module.state, { amountType: EFinancialAmountModes.Fixed, index: 1, parentIndex: 0 });

        expect(module.state.mainItems[0].subRows[1].amountType).toEqual(EFinancialAmountModes.Fixed);
      });
    });

    describe('setSubItemDocumentationRequired', () => {
      it('sets the setSubItemDocumentationRequired', () => {
        module.state.mainItems = mockItems();

        module.mutations.setSubItemDocumentationRequired(module.state, { documentationRequired: true, index: 1, parentIndex: 0 });

        expect(module.state.mainItems[0].subRows[1].documentationRequired).toEqual(true);
      });
    });

    describe('setSubItemFrequency', () => {
      it('sets the setSubItemFrequency', () => {
        module.state.mainItems = mockItems();

        module.mutations.setSubItemFrequency(module.state, { frequency: EFinancialFrequency.Multiple, index: 1, parentIndex: 0 });

        expect(module.state.mainItems[0].subRows[1].frequency).toEqual(EFinancialFrequency.Multiple);
      });
    });

    describe('addItem', () => {
      it('adds item', () => {
        const item = mockItems()[1];

        module.state.mainItems = mockItems();

        expect(module.state.mainItems.length).toBe(2);

        module.mutations.addItem(module.state, { item });

        expect(module.state.mainItems.length).toBe(3);
      });
    });

    describe('addSubItem', () => {
      it('sets the addSubItem', () => {
        module.state.mainItems = mockItems();

        expect(module.state.mainItems[1].subRows.length).toEqual(1);

        const subItem = mockSubItems()[1];

        module.mutations.addSubItem(module.state, { subItem, index: 1 });

        expect(module.state.mainItems[1].subRows.length).toEqual(2);
      });
    });

    describe('setItemSubItems', () => {
      it('sets the subItems', () => {
        const subItems = mockSubItems();

        module.state.mainItems = mockItems();

        module.mutations.setItemSubItems(module.state, { index: 1, subItems });

        expect(module.state.mainItems[1].subRows).toStrictEqual(subItems);
      });
    });

    describe('setEditedItem', () => {
      it('sets the editedItem', () => {
        const editedItem = mockItems()[1];

        module.mutations.setEditedItem(module.state, { editedItem });

        expect(module.state.editedItem).toStrictEqual(editedItem);
      });
    });

    describe('setEditedItemIndex', () => {
      it('sets the editedItemIndex', () => {
        module.mutations.setEditedItemIndex(module.state, { editedItemIndex: 1 });

        expect(module.state.editedItemIndex).toStrictEqual(1);
      });
    });

    describe('setEditedSubItemIndex', () => {
      it('sets the editedSubItemIndex', () => {
        module.mutations.setEditedSubItemIndex(module.state, { editedSubItemIndex: 2 });

        expect(module.state.editedSubItemIndex).toEqual(2);
      });
    });

    describe('deleteItem', () => {
      it('deletes the item', () => {
        module.state.mainItems = mockItems();

        expect(module.state.mainItems.length).toEqual(2);

        module.mutations.deleteItem(module.state, { index: 1 });

        expect(module.state.mainItems.length).toEqual(1);
      });
    });

    describe('deleteSubItem', () => {
      it('deletes the subItem', () => {
        module.state.mainItems = mockItems();

        expect(module.state.mainItems[0].subRows.length).toEqual(2);

        module.mutations.deleteSubItem(module.state, { index: 0, parentIndex: 0 });

        expect(module.state.mainItems[0].subRows.length).toEqual(1);
      });
    });

    describe('setDirty', () => {
      it('sets the dirty', () => {
        expect(module.state.dirty).toEqual(false);

        module.mutations.setDirty(module.state, { dirty: true });

        expect(module.state.dirty).toEqual(true);
      });
    });

    describe('setFormDirty', () => {
      it('sets the formDirty', () => {
        expect(module.state.formDirty).toEqual(false);

        module.mutations.setFormDirty(module.state, { formDirty: true });

        expect(module.state.formDirty).toEqual(true);
      });
    });

    describe('setLoading', () => {
      it('sets the loading', () => {
        expect(module.state.loading).toEqual(false);

        module.mutations.setLoading(module.state, { loading: true });

        expect(module.state.loading).toEqual(true);
      });
    });

    describe('resetNewItem', () => {
      it('resets the newItem', () => {
        module.mutations.resetNewItem(module.state);

        expect(module.state.newItem.mainCategory).toEqual(null);
        expect(module.state.newItem.subRows).toEqual([]);
      });
    });

    describe('cancelOperation', () => {
      it('resets the related fields', () => {
        module.mutations.cancelOperation(module.state);

        expect(module.state.addingItem).toEqual(false);
        expect(module.state.editedItem).toEqual(null);
        expect(module.state.editedItemIndex).toEqual(-1);
        expect(module.state.editedSubItemIndex).toEqual(-1);
      });
    });

    describe('resetNewSubItem', () => {
      it('resets the newSubItem', () => {
        module.mutations.resetNewSubItem(module.state);

        expect(module.state.newSubItem.subCategory).toEqual(null);
        expect(module.state.newSubItem.maximumAmount).toEqual(0);
        expect(module.state.newSubItem.amountType).toEqual(EFinancialAmountModes.Fixed);
        expect(module.state.newSubItem.documentationRequired).toEqual(false);
        expect(module.state.newSubItem.frequency).toEqual(EFinancialFrequency.OneTime);
      });
    });

    describe('resetState', () => {
      it('resets the state', () => {
        module.mutations.resetState(module.state);

        expect(module.state.id).toEqual('');
        expect(module.state.name).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
        expect(module.state.program).toEqual(null);
        expect(module.state.mainItems).toEqual([]);
        expect(module.state.dirty).toEqual(false);
        expect(module.state.formDirty).toEqual(false);
        expect(module.state.loading).toEqual(false);
        expect(module.state.addingItem).toEqual(false);
        expect(module.state.editedItem).toEqual(null);
        expect(module.state.editedItemIndex).toEqual(-1);
        expect(module.state.editedSubItemIndex).toEqual(-1);
        expect(module.state.newItem).toEqual({
          mainCategory: null,
          subRows: [],
        });
        expect(module.state.newSubItem).toEqual({
          subCategory: null,
          maximumAmount: 0,
          amountType: EFinancialAmountModes.Fixed,
          documentationRequired: false,
          frequency: EFinancialFrequency.OneTime,
        });
      });
    });
  });

  describe('>> Actions', () => {
    describe('createFinancialAssistance', () => {
      it('calls the service', async () => {
        module.service.createFinancialAssistanceTable = jest.fn();

        expect(module.service.createFinancialAssistanceTable).toHaveBeenCalledTimes(0);

        await module.actions.createFinancialAssistance(actionContext, { table: true });

        expect(module.service.createFinancialAssistanceTable).toHaveBeenCalledTimes(1);
        expect(module.service.createFinancialAssistanceTable).toHaveBeenCalledWith({
          status: Status.Inactive,
          eventId: mockProgram.eventId,
          programId: mockProgram.id,
          name: mockFinancialAssistanceTableEntity().name,
          rows: mockItems().map((item) => ({
            mainCategory: {
              optionItemId: item.mainCategory.id,
              specifiedOther: null,
            },
            subRows: item.subRows.map((sub) => ({
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
            })),
          })),
        });
      });
    });

    describe('fetchActiveCategories', () => {
      it('calls the service', async () => {
        module.service.fetchActiveCategories = jest.fn();

        await module.actions.fetchActiveCategories();

        expect(module.service.fetchActiveCategories).toHaveBeenCalledTimes(1);
      });
    });
  });
});
