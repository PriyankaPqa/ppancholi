import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { mockFinancialAssistanceService } from '@libs/services-lib/financial-assistance-payments/entity';
import { mockOptionItemsService } from '@libs/services-lib/optionItems';
import _sortBy from 'lodash/sortBy';
import {
  IdParams,
  IFinancialAssistancePaymentEntity,
  mockCaseFinancialAssistanceEntity,
} from '@libs/entities-lib/financial-assistance-payment';
import { getExtensionComponents } from '@/pinia/financial-assistance-payment/financial-assistance-payment-extension';
import { EOptionLists, OptionItem, mockOptionItemData } from '@libs/entities-lib/optionItem';

const entityService = mockFinancialAssistanceService();
const optionsService = mockOptionItemsService();
const baseComponents = getBaseStoreComponents<IFinancialAssistancePaymentEntity, IdParams>(entityService);
const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-financial-assistance-payment': {
        financialAssistanceCategories: mockOptionItemData(),
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useFinancialAssistancePaymentTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService, optionsService);

  const useStore = defineStore('test-financial-assistance-payment', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return useFinancialAssistancePaymentTestStore(bComponents);
};

describe('Financial assistance payment store', () => {
  let store = null as ReturnType<typeof createTestStore>;
  let bComponents = {} as Record<string, unknown>;
  const entity = mockCaseFinancialAssistanceEntity();
  beforeEach(() => {
    bComponents = { addNewlyCreatedId: jest.fn(), set: jest.fn() };
    store = createTestStore({ ...baseComponents, ...bComponents });
  });

  describe('getFinancialAssistanceCategories', () => {
    test('the getter calls filterAndSortActiveItems with the right params and returns the result', () => {
      const store = createTestStore();
      const res = store.getFinancialAssistanceCategories(false);
      expect(res).toEqual(
        _sortBy(
          mockOptionItemData().map((e) => new OptionItem(e)),
          'orderRank',
        ),
      );
    });
  });

  describe('fetchFinancialAssistanceCategories', () => {
    it('should call optionItemService getOptionList and commit the result', async () => {
      const res = mockOptionItemData();
      const store = createTestStore();
      optionsService.getOptionList = jest.fn(() => res);
      await store.fetchFinancialAssistanceCategories();

      expect(optionsService.getOptionList).toBeCalledWith(EOptionLists.FinancialAssistanceCategories);
      expect(store.financialAssistanceCategories).toEqual(res);
      expect(store.financialAssistanceCategoriesFetched).toEqual(true);
    });
  });

  describe('addFinancialAssistancePayment', () => {
    it('calls the right service and returns the result', async () => {
      const res = await store.addFinancialAssistancePayment(entity);
      expect(entityService.addFinancialAssistancePayment).toBeCalledWith(entity);
      expect(res).toEqual(entity);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(entity);
      expect(bComponents.set).toBeCalledWith(entity);
    });
  });

  describe('editFinancialAssistancePayment', () => {
    it('calls the right service and returns the result', async () => {
      const res = await store.editFinancialAssistancePayment(entity);
      expect(entityService.editFinancialAssistancePayment).toBeCalledWith(entity);
      expect(res).toEqual(entity);
    });
  });

  describe('updatePaymentStatus', () => {
    it('calls the right service and returns the result', async () => {
      const id = 'mock-id';

      const res = await store.updatePaymentStatus({
        paymentGroupId: 'group-id',
        entityId: id,
        status: 2,
        cancellationReason: 5,
      });

      expect(entityService.updatePaymentStatus).toBeCalledWith({
        cancellationReason: 5, entityId: 'mock-id', paymentGroupId: 'group-id', status: 2,
      });
      expect(res).toEqual(entity);
    });
  });

  describe('submitApprovalRequest', () => {
    it('calls the right service and returns the result', async () => {
      const res = await store.submitApprovalRequest('1', '2');
      expect(entityService.submitApprovalRequest).toBeCalledWith('1', '2');
      expect(res).toEqual(entity);
    });
  });

  describe('submitApprovalAction', () => {
    it('calls the right service and returns the result', async () => {
      const payload = { approvalAction: 1, submittedTo: '2', rationale: 'my reason' };
      const res = await store.submitApprovalAction('1', payload);
      expect(entityService.submitApprovalAction).toBeCalledWith('1', payload);
      expect(res).toEqual(entity);
    });
  });

  describe('addFinancialAssistancePaymentLine', () => {
    it('calls the right service and returns the result', async () => {
      const id = 'mock-id';
      const res = await store.addFinancialAssistancePaymentLine(id, entity.groups[0]);

      expect(entityService.addFinancialAssistancePaymentLine).toBeCalledWith(id, entity.groups[0]);
      expect(res).toEqual(entity);
    });
  });

  describe('editFinancialAssistancePaymentLine', () => {
    it('calls the right service and returns the result', async () => {
      const id = 'mock-id';
      const res = await store.editFinancialAssistancePaymentLine(id, entity.groups[0]);

      expect(entityService.editFinancialAssistancePaymentLine).toBeCalledWith(id, entity.groups[0]);
      expect(res).toEqual(entity);
    });
  });

  describe('deleteFinancialAssistancePaymentLine', () => {
    it('calls the right service and returns the result', async () => {
      const id = 'mock-id';
      const res = await store.deleteFinancialAssistancePaymentLine(id, 'myId');
      expect(entityService.deleteFinancialAssistancePaymentLine).toBeCalledWith(id, 'myId');
      expect(res).toEqual(entity);
    });
  });

  describe('cancelFinancialAssistancePaymentLine', () => {
    it('calls the right service and returns the result', async () => {
      const id = 'mock-id';
      const res = await store.cancelFinancialAssistancePaymentLine(id, 'myId', 1);
      expect(entityService.cancelFinancialAssistancePaymentLine).toBeCalledWith(id, 'myId', 1);
      expect(res).toEqual(entity);
    });
  });
});
