import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockItems, mockCategories } from '@libs/entities-lib/financial-assistance';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import Component from '../Templates/AddItemItem.vue';

const localVue = createLocalVue();

const items = mockItems();
const categories = mockCategories();

const { financialAssistanceStore, pinia } = useMockFinancialAssistanceStore();

financialAssistanceStore.newItem = items[0];

describe('AddItemItem.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        financialAssistanceCategories: categories,
        items,
      },
    });
  });

  describe('Computed', () => {
    describe('value', () => {
      it('returns the right value', async () => {
        const item = mockItems()[0];
        financialAssistanceStore.newItem = item;

        expect(wrapper.vm.value).toEqual(item.mainCategory);
      });
    });

    describe('filteredCategories', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.financialAssistanceCategories.length).toBe(2);

        expect(wrapper.vm.items.length).toBe(2);

        expect(wrapper.vm.filteredCategories.length).toBe(2);
      });

      it('excludes inactive items', async () => {
        categories[0].status = 2;

        expect(wrapper.vm.financialAssistanceCategories.length).toBe(2);

        expect(wrapper.vm.items.length).toBe(2);

        expect(wrapper.vm.filteredCategories.length).toBe(1);
      });
    });
  });
});
