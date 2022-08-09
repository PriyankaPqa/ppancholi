import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockItems, mockCategories } from '@libs/entities-lib/financial-assistance';
import Component from '../Templates/AddItemItem.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const items = mockItems();
const categories = mockCategories();

storage.financialAssistance.getters.newItem = jest.fn(() => items[0]);

describe('AddItemItem.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        financialAssistanceCategories: categories,
        items,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('value', () => {
      it('returns the right value', async () => {
        const item = mockItems()[0];

        wrapper.vm.$storage.financialAssistance.getters.newItem = jest.fn(() => item);

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
