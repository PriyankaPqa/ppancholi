import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockItems, mockCategories, EFinancialAmountModes, EFinancialFrequency,
} from '@libs/entities-lib/financial-assistance';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import Vue from 'vue';
import Component from '../FinancialAssistanceItems.vue';

const { pinia, financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore();
const { financialAssistanceStore } = useMockFinancialAssistanceStore(pinia);
const localVue = createLocalVue();

Vue.config.silent = true;
describe('FinancialAssistanceItems.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        isEdit: false,
        isTableMode: false,
      },
    });
  });

  describe('Template', () => {
    test('Manage list button is displayed', () => {
      const manageListBtn = wrapper.find('[data-test="manage-list"]');

      expect(manageListBtn.exists()).toBe(true);
    });
  });

  describe('Computed', () => {
    describe('faCategories', () => {
      it('returns the right value', () => {
        financialAssistancePaymentStore.getFinancialAssistanceCategories = jest.fn(() => mockCategories());

        expect(wrapper.vm.faCategories).toEqual(mockCategories());
      });
    });

    describe('labels', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.labels).toEqual({
          addItem: 'financialAssistance.addItem',
          addSubItem: 'financialAssistance.addSubItem',
        });
      });
    });

    describe('items', () => {
      it('returns the right value', () => {
        financialAssistanceStore.mainItems = mockItems();
        expect(wrapper.vm.items).toEqual(mockItems());
      });
    });

    describe('addingItem', () => {
      it('returns the right value', async () => {
        financialAssistanceStore.addingItem = true;
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            isEdit: false,
            isTableMode: false,
          },
        });
        expect(wrapper.vm.addingItem).toEqual(true);
      });
    });

    describe('editedItem', () => {
      it('returns the right value', () => {
        const editedItem = mockItems()[0];

        financialAssistanceStore.editedItem = editedItem;
        expect(wrapper.vm.editedItem).toEqual(editedItem);
      });
    });

    describe('isOperating', () => {
      it('returns the right value', () => {
        financialAssistanceStore.isOperating = jest.fn(() => true);

        expect(wrapper.vm.isOperating).toEqual(true);
      });
    });

    describe('disableAddSubItem', () => {
      it('returns the right value', () => {
        financialAssistanceStore.isOperating = jest.fn(() => true);

        expect(wrapper.vm.disableAddSubItem).toEqual(true);
      });
    });

    describe('headers', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'financialAssistance.nestedTable.headers.item',
            value: 'mainCategory',
            cols: 2,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.subItem',
            value: 'subCategory',
            cols: 2,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.maximum',
            value: 'maximumAmount',
            cols: 1,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.amountType',
            value: 'amountType',
            cols: 2,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.documentationRequired',
            value: 'documentationRequired',
            cols: 2,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.frequency',
            value: 'frequency',
            cols: 2,
            align: 'left',
          },
          {
            text: '',
            value: 'buttons',
            cols: 1,
            align: 'right',
          },
        ]);
      });
    });
  });

  describe('Methods', () => {
    describe('showManageLists', () => {
      it('assign the true value showManageListsDialog', async () => {
        expect(wrapper.vm.showManageListsDialog).toBe(false);

        wrapper.vm.showManageLists();

        expect(wrapper.vm.showManageListsDialog).toBe(true);
      });
    });

    describe('getIsFormActive', () => {
      it('returns true if has editedItem or addingItem is true', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            isEdit: false,
            isTableMode: false,
          },
          computed: {
            editedItem() {
              return mockItems()[0];
            },
            addItem() {
              return true;
            },
          },
        });

        expect(wrapper.vm.getIsFormActive()).toBe(true);
      });

      it('returns true if has editedItem or addingItem has index', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            isEdit: false,
            isTableMode: false,
          },
          computed: {
            editedItem() {
              return mockItems()[0];
            },
            addItem() {
              return -1;
            },
          },
        });

        expect(wrapper.vm.getIsFormActive()).toBe(true);
      });
    });

    describe('getAmountType', () => {
      it('returns amount type list', async () => {
        const amountType = wrapper.vm.getAmountType({
          amountType: EFinancialAmountModes.Variable,
        });

        expect(amountType).toBe('enums.financialAmountModes.Variable');
      });
    });

    describe('getFrequency', () => {
      it('returns fre type list', async () => {
        const amountType = wrapper.vm.getFrequency({
          frequency: EFinancialFrequency.Multiple,
        });

        expect(amountType).toBe('enums.financialFrequency.Multiple');
      });
    });
  });
});
