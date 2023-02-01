import { mockCombinedHouseholds } from '@libs/entities-lib/household';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';

import Component from './HouseholdResultsMove.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HouseholdResultsMove.vue', () => {
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
      it('should emit select event with the householdid', async () => {
        await wrapper.vm.select('1');
        expect(wrapper.emitted('select')[0][0]).toEqual('1');
      });
    });
  });
});
