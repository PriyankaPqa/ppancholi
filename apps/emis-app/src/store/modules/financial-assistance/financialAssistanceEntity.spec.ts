import { ActionContext } from 'vuex';
import {
  EFinancialAmountModes,
  EFinancialFrequency, IFinancialAssistanceTableEntity, mockCombinedFinancialAssistance,
  mockFinancialAssistanceTableEntity,
  mockItemData,
  mockItems,
  mockSubItems,
} from '@libs/entities-lib/financial-assistance';
import { mockProgramEntity } from '@libs/entities-lib/program';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { httpClient } from '@/services/httpClient';
import { mockOptionItems } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/entities-lib/base';
import { FinancialAssistanceEntityModule } from './financialAssistanceEntity';

import { IFinancialAssistanceEntityState } from './financialAssistanceEntity.types';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const service = new FinancialAssistanceTablesService(httpClient);
let myModule: FinancialAssistanceEntityModule;

const mockProgram = mockProgramEntity();
const mockState: IFinancialAssistanceEntityState = {
  id: '',
  items: [],
  newlyCreatedIds: [],
  maxTimeInSecondsForNewlyCreatedIds: 60,
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
const signalR = mockSignalR();

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
    myModule = new FinancialAssistanceEntityModule(service, signalR);
  });

  describe('>> Getters', () => {
    describe('name', () => {
      it('returns the name', () => {
        myModule.mutations.setName(myModule.state, { name: 'new name', language: 'en' });

        expect(myModule.getters.name(myModule.state)('en')).toEqual('new name');
      });
    });

    describe('status', () => {
      it('returns the status', () => {
        myModule.mutations.setStatus(myModule.state, { status: Status.Active });

        expect(myModule.getters.status(myModule.state)).toEqual(Status.Active);
      });
    });

    describe('addingItem', () => {
      it('returns the addingItem', () => {
        myModule.mutations.setAddingItem(myModule.state, { addingItem: false });

        expect(myModule.getters.addingItem(myModule.state)).toEqual(false);
      });
    });

    describe('program', () => {
      it('returns the program', () => {
        myModule.mutations.setProgram(myModule.state, { program: mockProgram });

        expect(myModule.getters.program(myModule.state)).toEqual(mockProgram);
      });
    });

    describe('items', () => {
      it('returns the items', () => {
        myModule.mutations.setItems(myModule.state, { items: mockItems() });

        expect(myModule.getters.items(myModule.state)).toEqual(mockItems());
      });
    });

    describe('newItem', () => {
      it('returns the newItem', () => {
        expect(myModule.getters.newItem(myModule.state)).toEqual({
          mainCategory: null,
          subItems: [],
        });
      });
    });

    describe('newSubItem', () => {
      it('returns the newSubItem', () => {
        expect(myModule.getters.newSubItem(myModule.state)).toEqual({
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
        myModule.mutations.setEditedItem(myModule.state, { editedItem: mockItems()[0] });

        expect(myModule.getters.editedItem(myModule.state)).toEqual(mockItems()[0]);
      });
    });

    describe('editedItemIndex', () => {
      it('returns the editedItemIndex', () => {
        myModule.mutations.setEditedItemIndex(myModule.state, { editedItemIndex: -1 });

        expect(myModule.getters.editedSubItemIndex(myModule.state)).toEqual(-1);
      });
    });

    describe('subItems', () => {
      it('returns the subItems', () => {
        myModule.mutations.setItems(myModule.state, { items: mockItems() });

        expect(myModule.getters.subItems(myModule.state)(0)).toEqual(mockItems()[0].subItems);
      });
    });

    describe('dirty', () => {
      it('returns the dirty', () => {
        myModule.mutations.setDirty(myModule.state, { dirty: false });

        expect(myModule.getters.dirty(myModule.state)).toEqual(false);
      });
    });

    describe('formDirty', () => {
      it('returns the formDirty', () => {
        myModule.mutations.setFormDirty(myModule.state, { formDirty: false });

        expect(myModule.getters.formDirty(myModule.state)).toEqual(false);
      });
    });

    describe('loading', () => {
      it('returns the loading', () => {
        myModule.mutations.setLoading(myModule.state, { loading: false });

        expect(myModule.getters.loading(myModule.state)).toEqual(false);
      });
    });

    describe('isOperating', () => {
      it('returns the isOperating', () => {
        expect(myModule.getters.isOperating(myModule.state)).toEqual(false);

        myModule.state.addingItem = true;

        expect(myModule.getters.isOperating(myModule.state)).toEqual(true);
      });
    });
  });

  // eslint-disable-next-line
  describe('>> Mutations', () => {

    describe('setName', () => {
      it('sets the name', () => {
        myModule.mutations.setName(myModule.state, { name: 'test name', language: 'en' });

        expect(myModule.state.name.translation.en).toBe('test name');
      });
    });

    describe('setStatus', () => {
      it('sets the name', () => {
        myModule.mutations.setStatus(myModule.state, { status: Status.Active });

        expect(myModule.state.status).toEqual(Status.Active);
      });
    });

    describe('setAddingItem', () => {
      it('sets the setAddingItem', () => {
        myModule.mutations.setAddingItem(myModule.state, { addingItem: true });

        expect(myModule.state.addingItem).toEqual(true);
      });
    });

    describe('setProgram', () => {
      it('sets the setProgram', () => {
        const program = mockProgram;

        myModule.mutations.setProgram(myModule.state, { program });

        expect(myModule.state.program).toEqual(program);
      });
    });

    describe('setItems', () => {
      it('sets the setItems', () => {
        myModule.mutations.setItems(myModule.state, { items: mockItems() });

        expect(myModule.state.mainItems).toEqual(mockItems());
      });
    });

    describe('setNewItemItem', () => {
      it('sets the setNewItemItem', () => {
        const item = mockItems()[1];

        myModule.mutations.setNewItemItem(myModule.state, { item: item.mainCategory });

        expect(myModule.state.newItem.mainCategory).toEqual(item.mainCategory);
      });
    });

    describe('setNewSubItemSubItem', () => {
      it('sets the setNewSubItemSubItem', () => {
        const subItem = mockItems()[0].mainCategory.subitems[0];

        myModule.mutations.setNewSubItemSubItem(myModule.state, { subItem });

        expect(myModule.state.newSubItem.subCategory).toEqual(subItem);
      });
    });

    describe('setNewSubItemMaximum', () => {
      it('sets the setNewSubItemMaximum', () => {
        myModule.mutations.setNewSubItemMaximum(myModule.state, { maximum: 9 });

        expect(myModule.state.newSubItem.maximumAmount).toEqual(9);
      });
    });

    describe('setNewSubItemAmountType', () => {
      it('sets the setNewSubItemAmountType', () => {
        myModule.mutations.setNewSubItemAmountType(myModule.state, { amountType: EFinancialAmountModes.Fixed });

        expect(myModule.state.newSubItem.amountType).toEqual(EFinancialAmountModes.Fixed);
      });
    });

    describe('setNewSubItemDocumentationRequired', () => {
      it('sets the setNewSubItemDocumentationRequired', () => {
        myModule.mutations.setNewSubItemDocumentationRequired(myModule.state, { documentationRequired: true });

        expect(myModule.state.newSubItem.documentationRequired).toEqual(true);
      });
    });

    describe('setNewSubItemFrequency', () => {
      it('sets the setNewSubItemFrequency', () => {
        myModule.mutations.setNewSubItemFrequency(myModule.state, { frequency: EFinancialFrequency.Multiple });

        expect(myModule.state.newSubItem.frequency).toEqual(EFinancialFrequency.Multiple);
      });
    });

    describe('setItem', () => {
      it('sets the setItem', () => {
        const item = mockItems()[2];

        myModule.mutations.setItem(myModule.state, { item, index: 1 });

        expect(myModule.state.mainItems[1]).toEqual(item);
      });
    });

    describe('setItemItem', () => {
      it('sets the setItemItem', () => {
        const { mainCategory } = mockItems()[1];

        myModule.state.mainItems = mockItems();

        myModule.mutations.setItemItem(myModule.state, { item: mainCategory, index: 0 });

        expect(myModule.state.mainItems[0].mainCategory).toEqual(mainCategory);
      });
    });

    describe('setSubItem', () => {
      it('sets the setSubItem', () => {
        const subItem = mockSubItems()[1];

        myModule.state.mainItems = mockItems();

        myModule.mutations.setSubItem(myModule.state, { subItem, index: 1, parentIndex: 1 });

        expect(myModule.state.mainItems[1].subItems[1]).toEqual(subItem);
      });
    });

    describe('addItem', () => {
      it('adds item', () => {
        const item = mockItems()[1];

        myModule.state.mainItems = mockItems();

        expect(myModule.state.mainItems.length).toBe(2);

        myModule.mutations.addItem(myModule.state, { item });

        expect(myModule.state.mainItems.length).toBe(3);
      });
    });

    describe('addSubItem', () => {
      it('sets the addSubItem', () => {
        myModule.state.mainItems = mockItems();

        expect(myModule.state.mainItems[1].subItems.length).toEqual(1);

        const subItem = mockSubItems()[1];

        myModule.mutations.addSubItem(myModule.state, { subItem, index: 1 });

        expect(myModule.state.mainItems[1].subItems.length).toEqual(2);
      });
    });

    describe('setEditedItem', () => {
      it('sets the editedItem', () => {
        const editedItem = mockItems()[1];

        myModule.mutations.setEditedItem(myModule.state, { editedItem });

        expect(myModule.state.editedItem).toStrictEqual(editedItem);
      });
    });

    describe('setEditedItemIndex', () => {
      it('sets the editedItemIndex', () => {
        myModule.mutations.setEditedItemIndex(myModule.state, { editedItemIndex: 1 });

        expect(myModule.state.editedItemIndex).toStrictEqual(1);
      });
    });

    describe('setEditedSubItemIndex', () => {
      it('sets the editedSubItemIndex', () => {
        myModule.mutations.setEditedSubItemIndex(myModule.state, { editedSubItemIndex: 2 });

        expect(myModule.state.editedSubItemIndex).toEqual(2);
      });
    });

    describe('deleteItem', () => {
      it('deletes the item', () => {
        myModule.state.mainItems = mockItems();

        expect(myModule.state.mainItems.length).toEqual(2);

        myModule.mutations.deleteItem(myModule.state, { index: 1 });

        expect(myModule.state.mainItems.length).toEqual(1);
      });
    });

    describe('deleteSubItem', () => {
      it('deletes the subItem', () => {
        myModule.state.mainItems = mockItems();

        expect(myModule.state.mainItems[0].subItems.length).toEqual(2);

        myModule.mutations.deleteSubItem(myModule.state, { index: 0, parentIndex: 0 });

        expect(myModule.state.mainItems[0].subItems.length).toEqual(1);
      });
    });

    describe('setDirty', () => {
      it('sets the dirty', () => {
        expect(myModule.state.dirty).toEqual(false);

        myModule.mutations.setDirty(myModule.state, { dirty: true });

        expect(myModule.state.dirty).toEqual(true);
      });
    });

    describe('setFormDirty', () => {
      it('sets the formDirty', () => {
        expect(myModule.state.formDirty).toEqual(false);

        myModule.mutations.setFormDirty(myModule.state, { formDirty: true });

        expect(myModule.state.formDirty).toEqual(true);
      });
    });

    describe('setLoading', () => {
      it('sets the loading', () => {
        expect(myModule.state.loading).toEqual(false);

        myModule.mutations.setLoading(myModule.state, { loading: true });

        expect(myModule.state.loading).toEqual(true);
      });
    });

    describe('resetNewItem', () => {
      it('resets the newItem', () => {
        myModule.mutations.resetNewItem(myModule.state);

        expect(myModule.state.newItem.mainCategory).toEqual(null);
        expect(myModule.state.newItem.subItems).toEqual([]);
      });
    });

    describe('cancelOperation', () => {
      it('resets the related fields', () => {
        myModule.mutations.cancelOperation(myModule.state);

        expect(myModule.state.addingItem).toEqual(false);
        expect(myModule.state.editedItem).toEqual(null);
        expect(myModule.state.editedItemIndex).toEqual(-1);
        expect(myModule.state.editedSubItemIndex).toEqual(-1);
      });
    });

    describe('resetNewSubItem', () => {
      it('resets the newSubItem', () => {
        myModule.mutations.resetNewSubItem(myModule.state);

        expect(myModule.state.newSubItem.subCategory).toEqual(null);
        expect(myModule.state.newSubItem.maximumAmount).toEqual(0);
        expect(myModule.state.newSubItem.amountType).toEqual(EFinancialAmountModes.Fixed);
        expect(myModule.state.newSubItem.documentationRequired).toEqual(false);
        expect(myModule.state.newSubItem.frequency).toEqual(EFinancialFrequency.OneTime);
      });
    });

    describe('resetState', () => {
      it('resets the state', () => {
        myModule.mutations.resetState(myModule.state);

        expect(myModule.state.id).toEqual('');
        expect(myModule.state.name).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
        expect(myModule.state.program).toEqual(null);
        expect(myModule.state.mainItems).toEqual([]);
        expect(myModule.state.dirty).toEqual(false);
        expect(myModule.state.formDirty).toEqual(false);
        expect(myModule.state.loading).toEqual(false);
        expect(myModule.state.addingItem).toEqual(false);
        expect(myModule.state.editedItem).toEqual(null);
        expect(myModule.state.editedItemIndex).toEqual(-1);
        expect(myModule.state.editedSubItemIndex).toEqual(-1);
        expect(myModule.state.newItem).toEqual({
          mainCategory: null,
          subItems: [],
        });
        expect(myModule.state.newSubItem).toEqual({
          subCategory: null,
          maximumAmount: 0,
          amountType: EFinancialAmountModes.Fixed,
          documentationRequired: false,
          frequency: EFinancialFrequency.OneTime,
        });
      });
    });

    describe('setFinancialAssistance', () => {
      it('should set the id', () => {
        expect(myModule.state.id).toEqual('');

        myModule.mutations.setFinancialAssistance(myModule.state, {
          fa: mockCombinedFinancialAssistance(),
          categories: mockOptionItems(),
          program: mockProgram,
          removeInactiveItems: true,
        });

        expect(myModule.state.id).toEqual(mockCombinedFinancialAssistance().entity.id);
      });

      it('should set the program', () => {
        expect(myModule.state.program).toEqual(null);

        myModule.mutations.setFinancialAssistance(myModule.state, {
          fa: mockCombinedFinancialAssistance(),
          categories: mockOptionItems(),
          program: mockProgram,
          removeInactiveItems: true,
        });

        expect(myModule.state.program).toEqual(mockProgram);
      });

      it('should set the name', () => {
        expect(myModule.state.name).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });

        myModule.mutations.setFinancialAssistance(myModule.state, {
          fa: mockCombinedFinancialAssistance(),
          categories: mockOptionItems(),
          program: mockProgram,
          removeInactiveItems: true,
        });

        expect(myModule.state.name).toEqual(mockCombinedFinancialAssistance().entity.name);
      });

      it('should set the status', () => {
        expect(myModule.state.status).toEqual(Status.Inactive);

        myModule.mutations.setFinancialAssistance(myModule.state, {
          fa: mockCombinedFinancialAssistance(),
          categories: mockOptionItems(),
          program: mockProgram,
          removeInactiveItems: true,
        });

        expect(myModule.state.status).toEqual(mockCombinedFinancialAssistance().entity.status);
      });

      it('should set mainItems', () => {
        expect(myModule.state.mainItems).toEqual([]);

        myModule.mutations.setFinancialAssistance(myModule.state, {
          fa: mockCombinedFinancialAssistance(),
          categories: mockOptionItems(),
          program: mockProgram,
          removeInactiveItems: true,
        });

        expect(myModule.state.mainItems.length).toEqual(2);
      });
    });
  });

  describe('>> Actions', () => {
    describe('createFinancialAssistance', () => {
      it('calls the service', async () => {
        const res = {} as IFinancialAssistanceTableEntity;
        myModule.service.createFinancialAssistanceTable = jest.fn(() => Promise.resolve(res));

        expect(myModule.service.createFinancialAssistanceTable).toHaveBeenCalledTimes(0);

        await myModule.actions.createFinancialAssistance(actionContext, { table: true });

        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
        expect(myModule.service.createFinancialAssistanceTable).toHaveBeenCalledTimes(1);
        expect(myModule.service.createFinancialAssistanceTable).toHaveBeenCalledWith({
          status: Status.Inactive,
          eventId: mockProgram.eventId,
          programId: mockProgram.id,
          name: mockFinancialAssistanceTableEntity().name,
          items: mockItems().map((item) => ({
            mainCategory: {
              optionItemId: item.mainCategory.id,
              specifiedOther: null,
            },
            subItems: item.subItems.map((sub) => ({
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

    describe('editFinancialAssistance', () => {
      it('calls the service', async () => {
        myModule.service.editFinancialAssistanceTable = jest.fn();

        expect(myModule.service.editFinancialAssistanceTable).toHaveBeenCalledTimes(0);

        actionContext.state.id = 'id';

        await myModule.actions.editFinancialAssistance(actionContext);

        expect(myModule.service.editFinancialAssistanceTable).toHaveBeenCalledTimes(1);
        expect(myModule.service.editFinancialAssistanceTable).toHaveBeenCalledWith('id', {
          status: Status.Inactive,
          name: mockFinancialAssistanceTableEntity().name,
        });
      });
    });

    describe('createSubItem', () => {
      it('calls the service', async () => {
        myModule.service.createSubItem = jest.fn();

        expect(myModule.service.createSubItem).toHaveBeenCalledTimes(0);

        const mainItems = mockItems();
        const faId = 'faId';

        const itemIndex = 0;
        const subItem = mockSubItems()[0];

        actionContext.state.id = faId;
        actionContext.state.mainItems = mainItems;

        await myModule.actions.createSubItem(actionContext, { itemIndex, subItem });

        expect(myModule.service.createSubItem).toHaveBeenCalledTimes(1);
        expect(myModule.service.createSubItem).toHaveBeenCalledWith(faId, mainItems[itemIndex].id, {
          subCategory: {
            optionItemId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
            specifiedOther: null,
          },
          maximumAmount: 1,
          amountType: EFinancialAmountModes.Fixed,
          documentationRequired: false,
          frequency: EFinancialFrequency.OneTime,
          id: undefined,
        });
      });
    });

    describe('editSubItem', () => {
      it('calls the service', async () => {
        myModule.service.editSubItem = jest.fn();

        expect(myModule.service.editSubItem).toHaveBeenCalledTimes(0);

        const mainItems = mockItems();
        const faId = 'faId';

        const itemIndex = 0;
        const subItemIndex = 0;
        const subItem = mockSubItems()[0];

        actionContext.state.id = faId;
        actionContext.state.mainItems = mainItems;

        await myModule.actions.editSubItem(actionContext, { itemIndex, subItemIndex, subItem });

        expect(myModule.service.editSubItem).toHaveBeenCalledTimes(1);
        expect(myModule.service.editSubItem).toHaveBeenCalledWith(faId, mainItems[itemIndex].id, mainItems[itemIndex].subItems[subItemIndex].id, {
          subCategory: {
            optionItemId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
            specifiedOther: null,
          },
          maximumAmount: 1,
          amountType: EFinancialAmountModes.Fixed,
          documentationRequired: false,
          frequency: EFinancialFrequency.OneTime,
          id: undefined,
        });
      });
    });

    describe('deleteSubItem', () => {
      it('calls the service', async () => {
        myModule.service.deleteSubItem = jest.fn();

        expect(myModule.service.deleteSubItem).toHaveBeenCalledTimes(0);

        const mainItems = mockItems();
        const faId = 'faId';

        const itemIndex = 0;
        const subItemIndex = 0;

        actionContext.state.id = faId;
        actionContext.state.mainItems = mainItems;

        await myModule.actions.deleteSubItem(actionContext, { itemIndex, subItemIndex });

        expect(myModule.service.deleteSubItem).toHaveBeenCalledTimes(1);
        expect(myModule.service.deleteSubItem).toHaveBeenCalledWith(faId, mainItems[itemIndex].id, mainItems[itemIndex].subItems[subItemIndex].id);
      });
    });

    describe('deleteItem', () => {
      it('calls the service', async () => {
        myModule.service.deleteItem = jest.fn();

        expect(myModule.service.deleteItem).toHaveBeenCalledTimes(0);

        const mainItems = mockItems();
        const faId = 'faId';

        const itemIndex = 0;

        actionContext.state.id = faId;
        actionContext.state.mainItems = mainItems;

        await myModule.actions.deleteItem(actionContext, { itemIndex });

        expect(myModule.service.deleteItem).toHaveBeenCalledTimes(1);
        expect(myModule.service.deleteItem).toHaveBeenCalledWith(faId, mainItems[itemIndex].id);
      });
    });

    describe('reloadItems', () => {
      it('dispatches the action', async () => {
        actionContext.state.id = 'faId';
        // eslint-disable-next-line
        (actionContext.dispatch as any) = jest.fn(() => ({
          items: [mockItemData()],
        }));

        await myModule.actions.reloadItems(actionContext, { categories: [] });

        expect(actionContext.dispatch).toHaveBeenCalledWith('fetch', {
          idParams: 'faId',
        });
      });
    });

    describe('fetchByProgramId', () => {
      it('calls the service with proper parameters', async () => {
        myModule.service.fetchByProgramId = jest.fn();

        expect(myModule.service.fetchByProgramId).toHaveBeenCalledTimes(0);

        await myModule.actions.fetchByProgramId(actionContext, { programId: 'programId' });

        expect(myModule.service.fetchByProgramId).toHaveBeenCalledTimes(1);
        expect(myModule.service.fetchByProgramId).toHaveBeenCalledWith('programId');
      });
    });
  });
});
