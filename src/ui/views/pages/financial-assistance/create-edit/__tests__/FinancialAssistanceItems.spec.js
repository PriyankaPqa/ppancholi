import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockItems } from '@/entities/financial-assistance';
import { mockStorage } from '@/store/storage';
import Component from '../FinancialAssistanceItems.vue';

const localVue = createLocalVue();
describe('FinancialAssistanceItems.vue', () => {
  let wrapper;
  const storage = mockStorage();

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        isEdit: false,
        isTableMode: false,
      },
      mocks: {
        $storage: storage,
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
        wrapper.vm.$storage.financialAssistance.getters.items = jest.fn(() => mockItems());

        expect(wrapper.vm.items).toEqual(mockItems());
      });
    });

    describe('addingItem', () => {
      it('returns the right value', () => {
        wrapper.vm.$storage.financialAssistance.getters.addingItem = jest.fn(() => true);

        expect(wrapper.vm.addingItem).toEqual(true);
      });
    });

    describe('editedItem', () => {
      it('returns the right value', () => {
        const editedItem = mockItems()[0];

        wrapper.vm.$storage.financialAssistance.getters.editedItem = jest.fn(() => editedItem);

        expect(wrapper.vm.editedItem).toEqual(editedItem);
      });
    });

    describe('isOperating', () => {
      it('returns the right value', () => {
        wrapper.vm.$storage.financialAssistance.getters.isOperating = jest.fn(() => true);

        expect(wrapper.vm.isOperating).toEqual(true);
      });
    });

    describe('disableAddSubItem', () => {
      it('returns the right value', () => {
        wrapper.vm.$storage.financialAssistance.getters.isOperating = jest.fn(() => true);

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
    describe('fetchFinancialAssistanceCategories', () => {
      it('fetches active financial assistance categories', async () => {
        wrapper.vm.$storage.financialAssistance.actions.fetchActiveCategories = jest.fn();

        expect(wrapper.vm.$storage.financialAssistance.actions.fetchActiveCategories).toHaveBeenCalledTimes(0);

        await wrapper.vm.fetchFinancialAssistanceCategories();

        expect(wrapper.vm.$storage.financialAssistance.actions.fetchActiveCategories).toHaveBeenCalledTimes(1);
      });
    });

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
  });
});
