import { createLocalVue, mount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import { mockItems, mockSubItems, mockCategories } from '@/entities/financial-assistance';
import { Status } from '@libs/core-lib/entities/base';
import Component from '../Templates/AddSubItemSubItem.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const categories = mockCategories();

const item = mockItems()[0];

const subItem = mockSubItems()[0];
storage.financialAssistance.getters.newSubItem = jest.fn(() => subItem);

describe('AddSubItemSubItem.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        parent: item,
        financialAssistanceCategories: categories,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('value', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.value).toEqual(subItem.subCategory);
      });

      it('sets the right value', async () => {
        jest.clearAllMocks();

        wrapper.vm.value = null;

        expect(storage.financialAssistance.mutations.setNewSubItemSubItem).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setNewSubItemSubItem).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('Methods', () => {
    describe('getSubItems', () => {
      it('returns all subitems minus existing subItems', async () => {
        expect(wrapper.vm.parent.mainCategory.subitems.length).toEqual(3);
        expect(wrapper.vm.parent.subItems.length).toEqual(2);

        expect(wrapper.vm.getSubItems().length).toEqual(0);
      });

      it('returns default subItem if no subItems', async () => {
        item.mainCategory.subitems = [];

        expect(wrapper.vm.getSubItems()).toEqual([
          {
            tenantId: '',
            created: '',
            timestamp: '',
            createdBy: '',
            lastUpdatedBy: '',
            lastAction: '',
            lastActionCorrelationId: '',
            name: {
              translation: {
                en: 'Default',
                fr: 'Défaut',
              },
            },
            orderRank: 0,
            status: Status.Active,
            isOther: false,
            isDefault: true,
            id: '-1',
          },
        ]);
      });
    });
  });
});
