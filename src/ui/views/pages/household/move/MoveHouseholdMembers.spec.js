import { mockHouseholdCreate } from '@crctech/registration-lib/src/entities/household-create';
import { mockCombinedHousehold } from '@crctech/registration-lib/src/entities/household';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';

import Component from './MoveHouseholdMembers.vue';
import routes from '@/constants/routes';
import HouseholdResults from '@/ui/views/pages/household/move/HouseholdResults.vue';
import HouseholdSearch from '@/ui/views/pages/registration/is-registered/HouseholdSearch.vue';

const localVue = createLocalVue();
const household = mockCombinedHousehold();
const storage = mockStorage();

describe('MoveHouseholdMembers.vue', () => {
  let wrapper;

  describe('lifecycle', () => {
    describe('created', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            currentHousehold: () => ({ id: '' }),
          },
        });
      });

      it('goes back to household profile if no householdCreate in the store', async () => {
        wrapper.vm.back = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: household.entity.id,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('back', () => {
      it('should redirect to household profile page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({ name: routes.household.householdProfile.name });
      });
    });

    describe('onSearch', () => {
      it('should be called when search is emitted', async () => {
        await wrapper.setData({ showResults: false });
        const component = wrapper.findComponent(HouseholdSearch);
        wrapper.vm.onSearch = jest.fn();
        component.vm.$emit('search');
        expect(wrapper.vm.onSearch).toBeCalled();
      });

      it('should call search from the mixin with proper params', async () => {
        wrapper.vm.search = jest.fn();
        await wrapper.vm.onSearch(null);
        expect(wrapper.vm.search).toHaveBeenLastCalledWith(null);
      });

      it('should set searchResultsWithoutFirst', async () => {
        wrapper.vm.search = jest.fn();
        await wrapper.setData({
          searchResults: [
            { entity: { id: '1' } },
            { entity: { id: '2' } },
          ],
          firstHousehold: { id: '1' },
        });
        await wrapper.vm.onSearch(null);
        expect(wrapper.vm.searchResultsWithoutFirst).toEqual([{ entity: { id: '2' } }]);
      });

      it('should set showResults to true', async () => {
        wrapper.vm.search = jest.fn();
        expect(wrapper.vm.showResults).toBe(false);
        await wrapper.vm.onSearch(null);
        expect(wrapper.vm.showResults).toBe(true);
      });
    });

    describe('onSelect', () => {
      it('should be called when select is emitted', async () => {
        await wrapper.setData({ showResults: true });
        const component = wrapper.findComponent(HouseholdResults);
        wrapper.vm.onSelect = jest.fn();
        component.vm.$emit('select');
        expect(wrapper.vm.onSelect).toBeCalled();
      });

      it('should set the selected household', async () => {
        expect(wrapper.vm.secondHousehold).toBe(null);
        await wrapper.vm.onSelect(mockHouseholdCreate());
        expect(wrapper.vm.secondHousehold).toEqual(mockHouseholdCreate());
      });
    });

    describe('onReset', () => {
      it('should be called when reset is emitted', async () => {
        await wrapper.setData({ showResults: true });
        const component = wrapper.findComponent(HouseholdResults);
        wrapper.vm.onReset = jest.fn();
        component.vm.$emit('reset');
        expect(wrapper.vm.onReset).toBeCalled();
      });

      it('should hide the results', async () => {
        wrapper.vm.search = jest.fn();
        await wrapper.vm.onSearch(null);
        expect(wrapper.vm.showResults).toBe(true);
        await wrapper.vm.onReset();
        expect(wrapper.vm.showResults).toBe(false);
      });
    });

    describe('removeSelection', () => {
      it('should be called when clicking close button', async () => {
        await wrapper.setData({ secondHousehold: mockHouseholdCreate() });
        const element = wrapper.findDataTest('removeSelection');
        wrapper.vm.removeSelection = jest.fn();
        element.vm.$emit('click');
        expect(wrapper.vm.removeSelection).toBeCalled();
      });

      it('should reset the secondHousehold', async () => {
        await wrapper.setData({ secondHousehold: mockHouseholdCreate() });
        await wrapper.vm.removeSelection();
        expect(wrapper.vm.secondHousehold).toBe(null);
      });
    });
  });
});
