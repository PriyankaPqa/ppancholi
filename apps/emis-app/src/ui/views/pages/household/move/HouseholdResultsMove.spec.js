import { HouseholdStatus, mockCombinedHouseholds } from '@libs/entities-lib/household';
import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockMember } from '@libs/entities-lib/value-objects/member';
import Component from './HouseholdResultsMove.vue';

const localVue = createLocalVue();

const mockFormattedItem = (householdStatus) => ({
  id: 'mock-id-1',
  householdStatus,
  primaryBeneficiary: { ...mockMember(), id: 'mock-person-id-1' },
  additionalMembers: [mockMember({ id: 'mock-person-id-2' })],
});

describe('HouseholdResultsMove.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        items: mockCombinedHouseholds(),
      },
      computed: {
        formattedItems: () => [mockFormattedItem(HouseholdStatus.Open)],
      },
    });
  });

  describe('Template', () => {
    describe('household-profile-status-chip', () => {
      it('should exist when has feature', () => {
        const element = wrapper.findDataTest('household-profile-status-chip');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('household_move_results_select', () => {
      it('should exist  household status is not Open', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            items: mockCombinedHouseholds(),
          },
          computed: {
            formattedItems: () => [mockFormattedItem(HouseholdStatus.Closed)],
          },
        });
        const button = wrapper.findDataTest('household_move_results_select');
        expect(button.props('disabled')).toBeTruthy();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          items: mockCombinedHouseholds(),
        },
        computed: {
          activeCaseFiles() {
            return [{ eventId: 'id-1' }, { eventId: 'id-2' }];
          },
          formattedItems: () => [mockFormattedItem(HouseholdStatus.Open)],
        },

      });
    });

    describe('reset', () => {
      it('be called when click on reset button', () => {
        wrapper.vm.reset = jest.fn();
        const element = wrapper.findDataTest('reset');
        element.vm.$emit('click');
        expect(wrapper.vm.reset).toBeCalled();
      });

      it('should emit reset', () => {
        wrapper.vm.reset();
        expect(wrapper.emitted('reset')).toBeTruthy();
      });
    });

    describe('select', () => {
      it('should emit select event with the householdid', async () => {
        await wrapper.vm.select('1');
        expect(wrapper.emitted('select')[0][0]).toEqual('1');
      });
    });
  });
});
