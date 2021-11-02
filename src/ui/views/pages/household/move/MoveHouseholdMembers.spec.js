import { mockHouseholdCreate, mockShelterData } from '@crctech/registration-lib/src/entities/household-create';
import { mockCombinedHousehold } from '@crctech/registration-lib/src/entities/household';
import { mockShelterLocations } from '@crctech/registration-lib/src/entities/event/event.mock';
import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';
import flushPromises from 'flush-promises';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';

import Component from './MoveHouseholdMembers.vue';
import HouseholdResults from '@/ui/views/pages/household/move/HouseholdResults.vue';
import HouseholdSearch from '@/ui/views/pages/registration/is-registered/HouseholdSearch.vue';

const localVue = createLocalVue();
const household = mockCombinedHousehold();
const householdCreate = { ...mockHouseholdCreate(), id: 'id-1' };
const storage = mockStorage();

describe('MoveHouseholdMembers.vue', () => {
  let wrapper;
  storage.household.actions.fetch = jest.fn(() => mockCombinedHousehold());

  describe('lifecycle', () => {
    describe('created', () => {
      beforeEach(async () => {
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
            currentHousehold: () => (householdCreate),
          },
        });

        await flushPromises();
      });

      it('goes back to household profile if no householdCreate in the store', async () => {
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
        wrapper.vm.back = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();

        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });

      it('sets the firstHousehold data', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();

        expect(wrapper.vm.firstHousehold).toEqual({ ...householdCreate, movingAdditionalMembers: [], hasOutstandingPayments: false });
      });

      it('should call the household action fetch', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();

        expect(storage.household.actions.fetch).toHaveBeenCalledWith(householdCreate.id);
      });

      it('should call fetchShelterLocations', async () => {
        wrapper.vm.fetchShelterLocations = jest.fn(() => []);
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();

        expect(wrapper.vm.fetchShelterLocations).toHaveBeenCalledWith(mockCombinedHousehold(), true);
      });

      it('should call hasOutstandingPayments', async () => {
        wrapper.vm.$services.households.hasOutstandingPayments = jest.fn(() => ({ hasOutstandingPayments: true }));
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();

        expect(wrapper.vm.$services.households.hasOutstandingPayments).toHaveBeenCalledWith(householdCreate.id);
        expect(wrapper.vm.firstHousehold.hasOutstandingPayments).toEqual(true);
      });

      it('should set firstHouseholdShelterLocations', async () => {
        wrapper.vm.fetchShelterLocations = jest.fn(() => [mockShelterData()]);
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.firstHouseholdShelterLocations).toEqual([mockShelterData()]);
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
        computed: { currentHousehold() { return householdCreate; } },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('back', () => {
      it('should redirect to household profile page', () => {
        wrapper.vm.$router.back = jest.fn();
        wrapper.vm.back();
        expect(wrapper.vm.$router.back).toHaveBeenCalled();
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

      it('should set the selected household and shelterLocations', async () => {
        expect(wrapper.vm.secondHousehold).toBe(null);
        const shelterLocations = mockShelterLocations();
        await wrapper.vm.onSelect({ household: mockHouseholdCreate(), shelterLocations });
        expect(wrapper.vm.secondHousehold).toEqual({ ...mockHouseholdCreate(), movingAdditionalMembers: [], hasOutstandingPayments: false });
        expect(wrapper.vm.secondHouseholdShelterLocations).toEqual(shelterLocations);
        expect(wrapper.vm.$services.households.hasOutstandingPayments).toHaveBeenLastCalledWith(mockHouseholdCreate().id);
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

      it('should reset the first Household', async () => {
        await wrapper.vm.removeSelection();
        expect(wrapper.vm.firstHousehold).toEqual({ ...householdCreate, movingAdditionalMembers: [] });
      });
    });

    describe('move', () => {
      it('calls moveMember with right payload when direction is left and sets the data into the right household variables', async () => {
        const firstHousehold = {
          ...mockHouseholdCreate(), id: '1', movingAdditionalMembers: [], hasOutstandingPayments: false,
        };
        const secondHousehold = {
          ...mockHouseholdCreate(), id: '2', movingAdditionalMembers: [], hasOutstandingPayments: false,
        };
        const originHousehold = {
          ...mockHouseholdCreate(), id: '3', movingAdditionalMembers: [], hasOutstandingPayments: false,
        };
        const targetHousehold = {
          ...mockHouseholdCreate(), id: '4', movingAdditionalMembers: [], hasOutstandingPayments: false,
        };

        wrapper.vm.moveMember = jest.fn(() => ({ originHousehold, targetHousehold }));
        await wrapper.setData({ firstHousehold, secondHousehold });

        await wrapper.vm.move({ member: mockMember(), direction: 'left' });
        expect(wrapper.vm.moveMember).toHaveBeenCalledWith(mockMember(), secondHousehold, firstHousehold);
        expect(wrapper.vm.firstHousehold).toEqual(targetHousehold);
        expect(wrapper.vm.secondHousehold).toEqual(originHousehold);
      });

      it('calls moveMember with right payload when direction is right and sets the data into the right household variables', async () => {
        const firstHousehold = {
          ...mockHouseholdCreate(), id: '1', movingAdditionalMembers: [], hasOutstandingPayments: false,
        };
        const secondHousehold = {
          ...mockHouseholdCreate(), id: '2', movingAdditionalMembers: [], hasOutstandingPayments: false,
        };
        const originHousehold = {
          ...mockHouseholdCreate(), id: '3', movingAdditionalMembers: [], hasOutstandingPayments: false,
        };
        const targetHousehold = {
          ...mockHouseholdCreate(), id: '4', movingAdditionalMembers: [], hasOutstandingPayments: false,
        };

        wrapper.vm.moveMember = jest.fn(() => ({ originHousehold, targetHousehold }));
        await wrapper.setData({ firstHousehold, secondHousehold });

        await wrapper.vm.move({ member: mockMember(), direction: 'right' });
        expect(wrapper.vm.moveMember).toHaveBeenCalledWith(mockMember(), firstHousehold, secondHousehold);
        expect(wrapper.vm.firstHousehold).toEqual(originHousehold);
        expect(wrapper.vm.secondHousehold).toEqual(targetHousehold);
      });
    });

    describe('moveMember', () => {
      it('should add the moving member to the target household movingAdditionalMembers list, if member does not move back', async () => {
        const movingMember = { ...mockMember(), id: 'moving' };
        const originHousehold = { ...mockHouseholdCreate(), id: 'origin', movingAdditionalMembers: [] };
        const targetHousehold = { ...mockHouseholdCreate(), id: 'target', movingAdditionalMembers: [] };
        originHousehold.removeAdditionalMember = jest.fn();

        const result = await wrapper.vm.moveMember(movingMember, originHousehold, targetHousehold);

        expect(result.targetHousehold).toEqual({
          ...targetHousehold,
          movingAdditionalMembers: [{ ...movingMember, selectedCurrentAddress: { sameAddressSelected: null, newAddress: null } }],
        });
      });

      // eslint-disable-next-line max-len
      it('should remove the moving member from the origin household additionalMembers list, if member does not move back and the origin household has a primary member', async () => {
        const movingMember = { ...mockMember(), id: 'moving' };
        const originHousehold = {
          ...mockHouseholdCreate(),
          id: 'origin',
          additionalMembers: [movingMember],
          movingAdditionalMembers: [],
        };
        const targetHousehold = { ...mockHouseholdCreate(), id: 'target', movingAdditionalMembers: [] };
        originHousehold.removeAdditionalMember = jest.fn(() => {});
        const result = await wrapper.vm.moveMember(movingMember, originHousehold, targetHousehold);

        expect(result.originHousehold.removeAdditionalMember).toHaveBeenCalledWith(0);
      });

      // eslint-disable-next-line max-len
      it('should remove the moving member as primary member of origin household, if member does not move back and the origin household has no additional members',
        async () => {
          const movingMember = { ...mockMember(), id: 'moving' };
          const originHousehold = {
            ...mockHouseholdCreate(),
            id: 'origin',
            additionalMembers: [],
            movingAdditionalMembers: [],
          };
          const targetHousehold = { ...mockHouseholdCreate(), id: 'target', movingAdditionalMembers: [] };
          originHousehold.setPrimaryBeneficiary = jest.fn(() => {});
          await wrapper.vm.moveMember(movingMember, originHousehold, targetHousehold);

          expect(originHousehold.setPrimaryBeneficiary).toHaveBeenCalledWith(null);
        });

      it('should remove the moving member from the list of moving members of origin household, if member moves back', async () => {
        const movingMember = { ...mockMember(), id: 'moving' };
        const originHousehold = {
          ...mockHouseholdCreate(),
          id: 'origin',
          additionalMembers: [],
          movingAdditionalMembers: [movingMember],
        };
        const targetHousehold = { ...mockHouseholdCreate(), id: 'target', movingAdditionalMembers: [] };
        targetHousehold.addAdditionalMember = jest.fn(() => {});
        const result = await wrapper.vm.moveMember(movingMember, originHousehold, targetHousehold);

        expect(result.originHousehold.movingAdditionalMembers).toEqual([]);
      });

      it('should add the moving member to the list of additional members of the target household, if member moves back', async () => {
        const movingMember = { ...mockMember(), id: 'moving' };
        const originHousehold = {
          ...mockHouseholdCreate(),
          id: 'origin',
          additionalMembers: [],
          movingAdditionalMembers: [movingMember],
        };
        const targetHousehold = { ...mockHouseholdCreate(), id: 'target', movingAdditionalMembers: [] };
        targetHousehold.addAdditionalMember = jest.fn(() => {});
        await wrapper.vm.moveMember(movingMember, originHousehold, targetHousehold);

        expect(targetHousehold.addAdditionalMember).toHaveBeenLastCalledWith({ ...movingMember, selectedCurrentAddress: null }, false);
      });
    });
  });
});
