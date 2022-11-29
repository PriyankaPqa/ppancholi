import { mockCombinedHouseholds, mockCombinedHousehold } from '@libs/entities-lib/household';
import { mockHouseholdCreateData } from '@libs/entities-lib/household-create/householdCreate.mock';
import { HouseholdCreate, mockShelterData } from '@libs/entities-lib/household-create';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { EEventLocationStatus } from '@libs/entities-lib/event';
import { mockStorage } from '@/storage';

import Component from './HouseholdResultsMove.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HouseholdResultsMove.vue', () => {
  let wrapper;
  storage.household.actions.fetch = jest.fn(() => mockCombinedHousehold());

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
        },
        mocks: {
          $storage: storage,
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
      it('should set selectedId', async () => {
        await wrapper.vm.select('1');
        expect(wrapper.vm.selectedId).toBe('1');
      });

      it('should call the household action fetch', async () => {
        await wrapper.vm.select('1');
        expect(storage.household.actions.fetch).toHaveBeenCalledWith('1');
      });

      it('should call fetchShelterLocations', async () => {
        wrapper.vm.fetchShelterLocations = jest.fn(() => []);
        await wrapper.vm.select('1');
        expect(wrapper.vm.fetchShelterLocations).toHaveBeenCalledWith(mockCombinedHousehold(), false);
      });

      it('should call buildHouseholdCreateData', async () => {
        wrapper.vm.fetchShelterLocations = jest.fn(() => [mockShelterData()]);
        wrapper.vm.buildHouseholdCreateData = jest.fn(() => {});
        await wrapper.vm.select('1');
        expect(wrapper.vm.buildHouseholdCreateData).toHaveBeenCalledWith(mockCombinedHousehold(), [mockShelterData()]);
      });

      it('should emit select event with built household and active shelter locations', async () => {
        const shelters = [{ ...mockShelterData(), id: 'id-1', status: EEventLocationStatus.Active },
          { ...mockShelterData(), id: 'id-2', status: EEventLocationStatus.Inactive }];
        wrapper.vm.buildHouseholdCreateData = jest.fn(() => mockHouseholdCreateData());
        wrapper.vm.fetchShelterLocations = jest.fn(() => shelters);
        await wrapper.vm.select('1');
        expect(wrapper.emitted('select')[0][0]).toEqual({
          household: new HouseholdCreate(mockHouseholdCreateData()),
          shelterLocations: [{ ...mockShelterData(), id: 'id-1', status: EEventLocationStatus.Active }],
        });
      });
    });
  });
});
