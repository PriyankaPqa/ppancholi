import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import {
  EFinancialAmountModes,
  EFinancialAssistanceStatus,
  EFinancialFrequency,
  mockFinancialAssistanceTable,
  mockItems,
  mockSubItems,
} from '@/entities/financial-assistance';
import { mockProgramsSearchData, Program } from '@/entities/program';
import { IMultilingual } from '@/types';
import { FINANCIAL_ASSISTANCE_MODULE } from '@/constants/vuex-modules';

describe('>>> Financial Assistance Module', () => {
  let store: Store<IRootState>;
  const mockProgram = new Program(mockProgramsSearchData()[0]);

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      modules: {
        financialAssistance: {
          state: {
            name: mockFinancialAssistanceTable().name,
            status: EFinancialAssistanceStatus.Inactive,
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
          },
        },
      },
    });
  });

  describe('>> Getters', () => {
    describe('name', () => {
      it('returns the name', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/name`]('en')).toEqual(mockFinancialAssistanceTable().name.translation.en);
      });
    });

    describe('status', () => {
      it('returns the status', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/status`]).toEqual(EFinancialAssistanceStatus.Inactive);
      });
    });

    describe('addingItem', () => {
      it('returns the addingItem', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/addingItem`]).toEqual(false);
      });
    });

    describe('program', () => {
      it('returns the program', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/program`]).toEqual(mockProgram);
      });
    });

    describe('items', () => {
      it('returns the items', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/items`]).toEqual(mockItems());
      });
    });

    describe('newItem', () => {
      it('returns the newItem', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/newItem`]).toEqual(mockItems()[1]);
      });
    });

    describe('newSubItem', () => {
      it('returns the newSubItem', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/newSubItem`]).toEqual(mockSubItems()[1]);
      });
    });

    describe('editedItem', () => {
      it('returns the editedItem', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/editedItem`]).toEqual(mockItems()[0]);
      });
    });

    describe('editedItemIndex', () => {
      it('returns the editedItemIndex', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/editedItemIndex`]).toEqual(-1);
      });
    });

    describe('subItems', () => {
      it('returns the subItems', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/subItems`](1)).toEqual(mockItems()[1].subRows);
      });
    });

    describe('dirty', () => {
      it('returns the dirty', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/dirty`]).toEqual(false);
      });
    });

    describe('formDirty', () => {
      it('returns the formDirty', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/formDirty`]).toEqual(false);
      });
    });

    describe('loading', () => {
      it('returns the loading', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/loading`]).toEqual(false);
      });
    });

    describe('isOperating', () => {
      it('returns the isOperating', () => {
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/isOperating`]).toEqual(true);

        store.state.financialAssistance.addingItem = false;
        store.state.financialAssistance.editedItem = null;
        store.state.financialAssistance.newItem.mainCategory = null;
        store.state.financialAssistance.newSubItem.subCategory = null;
        store.state.financialAssistance.editedItemIndex = -1;
        store.state.financialAssistance.editedSubItemIndex = -1;
        expect(store.getters[`${FINANCIAL_ASSISTANCE_MODULE}/isOperating`]).toEqual(false);
      });
    });
  });

  // eslint-disable-next-line
  describe('>> Mutations', () => {
    describe('setId', () => {
      it('sets the id', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setId`, { id: 'test id' });

        expect(store.state.financialAssistance.id).toBe('test id');
      });
    });

    describe('setName', () => {
      it('sets the name', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setName`, { name: 'new name', language: 'en' });

        expect(store.state.financialAssistance.name.translation.en).toBe('new name');
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

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setNameInAllLanguages`, { name: newName });

        expect(store.state.financialAssistance.name).toEqual(newName);
      });
    });

    describe('setStatus', () => {
      it('sets the name', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setStatus`, { status: EFinancialAssistanceStatus.Active });

        expect(store.state.financialAssistance.status).toBe(EFinancialAssistanceStatus.Active);
      });
    });

    describe('setAddingItem', () => {
      it('sets the setAddingItem', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setAddingItem`, { addingItem: true });

        expect(store.state.financialAssistance.addingItem).toBe(true);
      });
    });

    describe('setProgram', () => {
      it('sets the setProgram', () => {
        const program = new Program(mockProgramsSearchData()[1]);

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setProgram`, { program });

        expect(store.state.financialAssistance.program).toEqual(program);
      });
    });

    describe('setItems', () => {
      it('sets the setItems', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setItems`, { items: mockItems() });

        expect(store.state.financialAssistance.mainItems).toStrictEqual(mockItems());
      });
    });

    describe('setNewItemItem', () => {
      it('sets the setNewItemItem', () => {
        const item = mockItems()[1];
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setNewItemItem`, { item: item.mainCategory });

        expect(store.state.financialAssistance.newItem.mainCategory).toEqual(item.mainCategory);
      });
    });

    describe('setNewSubItemSubItem', () => {
      it('sets the setNewSubItemSubItem', () => {
        const subItem = mockItems()[0].mainCategory.subitems[0];
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setNewSubItemSubItem`, { subItem });

        expect(store.state.financialAssistance.newSubItem.subCategory).toEqual(subItem);
      });
    });

    describe('setNewSubItemMaximum', () => {
      it('sets the setNewSubItemMaximum', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setNewSubItemMaximum`, { maximum: 9 });

        expect(store.state.financialAssistance.newSubItem.maximumAmount).toBe(9);
      });
    });

    describe('setNewSubItemAmountType', () => {
      it('sets the setNewSubItemAmountType', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setNewSubItemAmountType`, { amountType: EFinancialAmountModes.Fixed });

        expect(store.state.financialAssistance.newSubItem.amountType).toBe(EFinancialAmountModes.Fixed);
      });
    });

    describe('setNewSubItemDocumentationRequired', () => {
      it('sets the setNewSubItemDocumentationRequired', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setNewSubItemDocumentationRequired`, { documentationRequired: true });

        expect(store.state.financialAssistance.newSubItem.documentationRequired).toBe(true);
      });
    });

    describe('setNewSubItemFrequency', () => {
      it('sets the setNewSubItemFrequency', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setNewSubItemFrequency`, { frequency: EFinancialFrequency.Multiple });

        expect(store.state.financialAssistance.newSubItem.frequency).toBe(EFinancialFrequency.Multiple);
      });
    });

    describe('setItem', () => {
      it('sets the setItem', () => {
        const item = mockItems()[2];
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setItem`, { item, index: 1 });

        expect(store.state.financialAssistance.mainItems[1]).toStrictEqual(item);
      });
    });

    describe('setItemItem', () => {
      it('sets the setItemItem', () => {
        const { mainCategory: item } = mockItems()[1];

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setItemItem`, { item, index: 1 });

        expect(store.state.financialAssistance.mainItems[1].mainCategory).toEqual(item);
      });
    });

    describe('setSubItem', () => {
      it('sets the setSubItem', () => {
        const subItem = mockSubItems()[1];

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setSubItem`, { subItem, index: 1, parentIndex: 1 });

        expect(store.state.financialAssistance.mainItems[1].subRows[1]).toEqual(subItem);
      });
    });

    describe('setSubItemSubItem', () => {
      it('sets the setSubItemSubItem', () => {
        const { subCategory: subItem } = mockSubItems()[1];

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setSubItemSubItem`, { subItem, index: 1, parentIndex: 0 });

        expect(store.state.financialAssistance.mainItems[0].subRows[1].subCategory).toEqual(subItem);
      });
    });

    describe('setSubItemMaximum', () => {
      it('sets the setSubItemMaximum', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setSubItemMaximum`, { maximum: 8, index: 1, parentIndex: 0 });

        expect(store.state.financialAssistance.mainItems[0].subRows[1].maximumAmount).toEqual(8);
      });
    });

    describe('setSubItemAmountType', () => {
      it('sets the setSubItemAmountType', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setSubItemAmountType`, { amountType: EFinancialAmountModes.Fixed, index: 1, parentIndex: 0 });

        expect(store.state.financialAssistance.mainItems[0].subRows[1].amountType).toEqual(EFinancialAmountModes.Fixed);
      });
    });

    describe('setSubItemDocumentationRequired', () => {
      it('sets the setSubItemDocumentationRequired', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setSubItemDocumentationRequired`, { documentationRequired: true, index: 1, parentIndex: 0 });

        expect(store.state.financialAssistance.mainItems[0].subRows[1].documentationRequired).toEqual(true);
      });
    });

    describe('setSubItemFrequency', () => {
      it('sets the setSubItemFrequency', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setSubItemFrequency`, { frequency: EFinancialFrequency.Multiple, index: 1, parentIndex: 0 });

        expect(store.state.financialAssistance.mainItems[0].subRows[1].frequency).toEqual(EFinancialFrequency.Multiple);
      });
    });

    describe('addItem', () => {
      it('adds item', () => {
        const item = mockItems()[1];

        expect(store.state.financialAssistance.mainItems.length).toBe(2);

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/addItem`, { item });

        expect(store.state.financialAssistance.mainItems.length).toBe(3);
      });
    });

    describe('addSubItem', () => {
      it('sets the addSubItem', () => {
        expect(store.state.financialAssistance.mainItems[1].subRows.length).toEqual(1);

        const { subCategory: subItem } = mockSubItems()[1];

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/addSubItem`, { subItem, index: 1 });

        expect(store.state.financialAssistance.mainItems[1].subRows.length).toEqual(2);
      });
    });

    describe('setItemSubItems', () => {
      it('sets the subItems', () => {
        const subItems = mockSubItems();

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setItemSubItems`, { index: 1, subItems });

        expect(store.state.financialAssistance.mainItems[1].subRows).toStrictEqual(subItems);
      });
    });

    describe('setEditedItem', () => {
      it('sets the editedItem', () => {
        const editedItem = mockItems()[1];

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setEditedItem`, { editedItem });

        expect(store.state.financialAssistance.editedItem).toStrictEqual(editedItem);
      });
    });

    describe('setEditedItemIndex', () => {
      it('sets the editedItemIndex', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setEditedItemIndex`, { editedItemIndex: 1 });

        expect(store.state.financialAssistance.editedItemIndex).toStrictEqual(1);
      });
    });

    describe('setEditedSubItemIndex', () => {
      it('sets the editedSubItemIndex', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setEditedSubItemIndex`, { editedSubItemIndex: 2 });

        expect(store.state.financialAssistance.editedSubItemIndex).toEqual(2);
      });
    });

    describe('deleteItem', () => {
      it('deletes the item', () => {
        expect(store.state.financialAssistance.mainItems.length).toEqual(2);

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/deleteItem`, { index: 1 });

        expect(store.state.financialAssistance.mainItems.length).toEqual(1);
      });
    });

    describe('deleteSubItem', () => {
      it('deletes the subItem', () => {
        expect(store.state.financialAssistance.mainItems[0].subRows.length).toEqual(2);

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/deleteSubItem`, { index: 0, parentIndex: 0 });

        expect(store.state.financialAssistance.mainItems[0].subRows.length).toEqual(1);
      });
    });

    describe('setDirty', () => {
      it('sets the dirty', () => {
        expect(store.state.financialAssistance.dirty).toEqual(false);

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setDirty`, { dirty: true });

        expect(store.state.financialAssistance.dirty).toEqual(true);
      });
    });

    describe('setFormDirty', () => {
      it('sets the formDirty', () => {
        expect(store.state.financialAssistance.formDirty).toEqual(false);

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setFormDirty`, { formDirty: true });

        expect(store.state.financialAssistance.formDirty).toEqual(true);
      });
    });

    describe('setLoading', () => {
      it('sets the loading', () => {
        expect(store.state.financialAssistance.loading).toEqual(false);

        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/setLoading`, { loading: true });

        expect(store.state.financialAssistance.loading).toEqual(true);
      });
    });

    describe('resetNewItem', () => {
      it('resets the newItem', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/resetNewItem`);

        expect(store.state.financialAssistance.newItem.mainCategory).toEqual(null);
        expect(store.state.financialAssistance.newItem.subRows).toEqual([]);
      });
    });

    describe('cancelOperation', () => {
      it('resets the related fields', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/cancelOperation`);

        expect(store.state.financialAssistance.addingItem).toEqual(false);
        expect(store.state.financialAssistance.editedItem).toEqual(null);
        expect(store.state.financialAssistance.editedItemIndex).toEqual(-1);
        expect(store.state.financialAssistance.editedSubItemIndex).toEqual(-1);
      });
    });

    describe('resetNewSubItem', () => {
      it('resets the newSubItem', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/resetNewSubItem`);

        expect(store.state.financialAssistance.newSubItem.subCategory).toEqual(null);
        expect(store.state.financialAssistance.newSubItem.maximumAmount).toEqual(0);
        expect(store.state.financialAssistance.newSubItem.amountType).toEqual(EFinancialAmountModes.Fixed);
        expect(store.state.financialAssistance.newSubItem.documentationRequired).toEqual(false);
        expect(store.state.financialAssistance.newSubItem.frequency).toEqual(EFinancialFrequency.OneTime);
      });
    });

    describe('resetState', () => {
      it('resets the state', () => {
        store.commit(`${FINANCIAL_ASSISTANCE_MODULE}/resetState`);

        expect(store.state.financialAssistance.id).toEqual('');
        expect(store.state.financialAssistance.name).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
        expect(store.state.financialAssistance.program).toEqual(null);
        expect(store.state.financialAssistance.mainItems).toEqual([]);
        expect(store.state.financialAssistance.dirty).toEqual(false);
        expect(store.state.financialAssistance.formDirty).toEqual(false);
        expect(store.state.financialAssistance.loading).toEqual(false);
        expect(store.state.financialAssistance.addingItem).toEqual(false);
        expect(store.state.financialAssistance.editedItem).toEqual(null);
        expect(store.state.financialAssistance.editedItemIndex).toEqual(-1);
        expect(store.state.financialAssistance.editedSubItemIndex).toEqual(-1);
        expect(store.state.financialAssistance.newItem).toEqual({
          mainCategory: null,
          subRows: [],
        });
        expect(store.state.financialAssistance.newSubItem).toEqual({
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
        expect(store.$services.financialAssistanceTables.createFinancialAssistanceTable).toHaveBeenCalledTimes(0);

        await store.dispatch(`${FINANCIAL_ASSISTANCE_MODULE}/createFinancialAssistance`, { table: true });

        expect(store.$services.financialAssistanceTables.createFinancialAssistanceTable).toHaveBeenCalledTimes(1);
        expect(store.$services.financialAssistanceTables.createFinancialAssistanceTable).toHaveBeenLastCalledWith({
          eventId: mockProgram.eventId,
          programId: mockProgram.id,
          name: mockFinancialAssistanceTable().name,
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
        expect(store.$services.financialAssistanceTables.fetchActiveCategories).toHaveBeenCalledTimes(0);

        await store.dispatch(`${FINANCIAL_ASSISTANCE_MODULE}/fetchActiveCategories`);

        expect(store.$services.financialAssistanceTables.fetchActiveCategories).toHaveBeenCalledTimes(1);
      });
    });
  });
});
