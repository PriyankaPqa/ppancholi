import { mockCombinedHouseholds } from '@crctech/registration-lib/src/entities/household';
import { mockHouseholdCreateData } from '@crctech/registration-lib/src/entities/household-create/householdCreate.mock';
import { HouseholdCreate } from '@crctech/registration-lib/src/entities/household-create';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';

import Component from './HouseholdResults.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HouseholdResults.vue', () => {
  let wrapper;

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          items: mockCombinedHouseholds(),
        },
        computed: {
          activeCaseFiles() { return [{ eventId: 'id-1' }, { eventId: 'id-2' }]; },
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

      it('should call fetchHouseholdCreate', async () => {
        wrapper.vm.fetchHouseholdCreate = jest.fn();
        await wrapper.vm.select('1');
        expect(wrapper.vm.fetchHouseholdCreate).toHaveBeenCalledWith('1', null, false);
      });

      it('should emit select event with built household', async () => {
        wrapper.vm.buildHouseholdCreateData = jest.fn(() => mockHouseholdCreateData());
        await wrapper.vm.select('1');
        expect(wrapper.emitted('select')[0][0]).toEqual(new HouseholdCreate(mockHouseholdCreateData()));
      });
    });
  });
});
