import { mockHouseholdCreate } from '@libs/entities-lib/household-create';
import { mockCombinedHousehold } from '@libs/entities-lib/household';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import flushPromises from 'flush-promises';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers/helpers';

import HouseholdResults from '@/ui/views/pages/household/move/HouseholdResultsMove.vue';
import HouseholdSearch from '@/ui/views/pages/household/search/HouseholdSearch.vue';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';

import { mockProvider } from '@/services/provider';
import Component from './MoveHouseholdMembers.vue';

const localVue = createLocalVue();
const services = mockProvider();
const household = mockCombinedHousehold();
const householdCreate = { ...mockHouseholdCreate(), id: 'id-1' };

const { pinia, householdStore } = useMockHouseholdStore();

describe('MoveHouseholdMembers.vue', () => {
  let wrapper;

  describe('lifecycle', () => {
    describe('created', () => {
      beforeEach(async () => {
        jest.clearAllMocks();
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            currentHousehold: () => (householdCreate),
          },
          mocks: {
            $services: services,
          },
        });

        await flushPromises();
      });

      it('goes back to household profile if no householdCreate in the store', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: household.entity.id,
          },
          mocks: {
            $services: services,
            $router: { back: jest.fn() },
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

      it('calls makeHousehold and stores the results in firstHousehold and firstHouseholdShelterLocations', async () => {
        wrapper.vm.makeHousehold = jest.fn(() => ({ household: { id: 'hh-1' }, shelterLocations: [{ id: 'sl-1' }] }));
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.makeHousehold).toHaveBeenCalled();
        expect(wrapper.vm.firstHousehold).toEqual({ id: 'hh-1' });
        expect(wrapper.vm.firstHouseholdShelterLocations).toEqual([{ id: 'sl-1' }]);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: household.entity.id,
        },
        computed: {
          currentHousehold() {
            return householdCreate;
          },
        },

        data() {
          return {
            firstHousehold: householdCreate,
          };
        },
        mocks: {
          $services: services,
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
            { id: '1' },
            { id: '2' },
          ],
          firstHousehold: { id: '1' },
        });
        await wrapper.vm.onSearch(null);
        expect(wrapper.vm.searchResultsWithoutFirst).toEqual([{ id: '2' }]);
      });

      it('should set showResults to true', async () => {
        wrapper.vm.search = jest.fn();
        expect(wrapper.vm.showResults).toBe(false);
        await wrapper.vm.onSearch(null);
        expect(wrapper.vm.showResults).toBe(true);
      });

      it('should call setSearchResultsShown mutation with proper parameter', async () => {
        await wrapper.vm.onSearch({});
        expect(householdStore.searchResultsShown).toEqual(false);
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

      it('calls makeHousehold with the household id and stores the results in secondHousehold and secondHouseholdShelterLocations', async () => {
        wrapper.vm.makeHousehold = jest.fn(() => ({ household: { id: 'hh-2' }, shelterLocations: [{ id: 'sl-2' }] }));
        await wrapper.vm.onSelect('id-2');
        await flushPromises();
        expect(wrapper.vm.makeHousehold).toHaveBeenCalledWith('id-2');
        expect(wrapper.vm.secondHousehold).toEqual({ id: 'hh-2' });
        expect(wrapper.vm.secondHouseholdShelterLocations).toEqual([{ id: 'sl-2' }]);
      });
    });

    describe('makeHousehold', () => {
      it('should call fetchHouseholdCreate if it receives an id as argument', async () => {
        wrapper.vm.fetchHouseholdCreate = jest.fn(() => householdCreate);
        await wrapper.vm.makeHousehold('hh-id');
        expect(wrapper.vm.fetchHouseholdCreate).toHaveBeenCalledWith('hh-id');
      });

      it('should use currentHousehold if it does not receive an id as argument', async () => {
        wrapper.vm.$services.households.hasOutstandingPayments = jest.fn(() => ({ hasOutstandingPayments: true }));
        const result = await wrapper.vm.makeHousehold();
        expect(result.household).toEqual({ ...householdCreate, movingAdditionalMembers: [], hasOutstandingPayments: true });
      });

      it('should call fetchShelterLocations', async () => {
        wrapper.vm.fetchShelterLocations = jest.fn(() => []);
        await wrapper.vm.makeHousehold();
        expect(wrapper.vm.fetchShelterLocations).toHaveBeenCalledWith(householdCreate.id);
      });

      it('should call hasOutstandingPayments', async () => {
        wrapper.vm.$services.households.hasOutstandingPayments = jest.fn(() => ({ hasOutstandingPayments: true }));
        await wrapper.vm.makeHousehold();
        expect(wrapper.vm.$services.households.hasOutstandingPayments).toHaveBeenCalledWith(householdCreate.id);
      });

      it('should return the right data', async () => {
        wrapper.vm.fetchShelterLocations = jest.fn(() => [{ id: 'sl-1' }]);
        wrapper.vm.$services.households.hasOutstandingPayments = jest.fn(() => ({ hasOutstandingPayments: true }));
        wrapper.vm.fetchHouseholdCreate = jest.fn(() => householdCreate);
        const result = await wrapper.vm.makeHousehold('hh-id');
        expect(result).toEqual(
          {
            household: { ...householdCreate, movingAdditionalMembers: [], hasOutstandingPayments: true },
            shelterLocations: [{ id: 'sl-1' }],
          },
        );
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
        expect(wrapper.vm.firstHousehold).toEqual({ ...householdCreate, movingAdditionalMembers: [], hasOutstandingPayments: false });
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

      // eslint-disable-next-line max-len,vue/max-len
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
      it(
        'should remove the moving member as primary member of origin household, if member does not move back and the origin household has no additional members',
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
        },
      );

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

    describe('submitMove', () => {
      it('should call scrollToFirstError if form is not valid', async () => {
        helpers.scrollToFirstError = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);

        await wrapper.vm.submitMove();
        expect(helpers.scrollToFirstError).toHaveBeenCalledWith('scrollAnchor');
      });

      it('should call setNewMembers and the household service moveMembers if form is  valid', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.setNewMembers = jest.fn();
        wrapper.vm.$services.households.moveMembers = jest.fn(() => {});

        await wrapper.vm.submitMove();
        expect(wrapper.vm.setNewMembers).toHaveBeenCalledWith(wrapper.vm.firstHousehold);
        expect(wrapper.vm.setNewMembers).toHaveBeenCalledWith(wrapper.vm.secondHousehold);
        expect(wrapper.vm.$services.households.moveMembers).toHaveBeenCalledWith(wrapper.vm.firstHousehold, wrapper.vm.secondHousehold);
      });

      it('should set moveSubmitted to true if there is a response from the service call', async () => {
        expect(wrapper.vm.moveSubmitted).toBeFalsy();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.setNewMembers = jest.fn();
        wrapper.vm.$services.households.moveMembers = jest.fn(() => [householdCreate]);
        await wrapper.vm.submitMove();
        expect(wrapper.vm.moveSubmitted).toBeTruthy();
      });
    });

    describe('setNewMembers', () => {
      it('should set the address and add to the household moving members', () => {
        const memberLeft = { ...mockMember(), id: 'new primary', selectedCurrentAddress: { sameAddressSelected: null, newAddress: 'new addr' } };
        const originHousehold = {
          ...mockHouseholdCreate(),
          id: 'origin',
          additionalMembers: [],
          movingAdditionalMembers: [memberLeft],
          primaryBeneficiary: null,
        };
        originHousehold.addAdditionalMember = jest.fn(() => {});
        memberLeft.setCurrentAddress = jest.fn(() => {});
        wrapper.vm.setNewMembers(originHousehold);

        expect(memberLeft.setCurrentAddress).toHaveBeenCalledWith('new addr');
        expect(originHousehold.addAdditionalMember).toHaveBeenCalledTimes(1);
        expect(originHousehold.movingAdditionalMembers).toEqual([]);
      });
    });
  });
});
