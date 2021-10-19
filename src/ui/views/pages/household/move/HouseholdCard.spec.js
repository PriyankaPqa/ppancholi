import { mockHouseholdCreate } from '@crctech/registration-lib/src/entities/household-create';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';

import Component from './HouseholdCard.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HouseholdCard.vue', () => {
  let wrapper;

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          household: mockHouseholdCreate(),
          position: 'left',
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('showHide', () => {
      it('should expand and reduce the section', () => {
        wrapper.vm.showHide(1);
        expect(wrapper.vm.expand[1]).toEqual(true); // expand
        wrapper.vm.showHide(1);
        expect(wrapper.vm.expand[1]).toEqual(false); // collapse
      });
    });

    describe('move', () => {
      it('should emit event move with proper direction and the member', async () => {
        const direction = 'right';
        const member = mockHouseholdCreate();

        await wrapper.setProps({ position: 'left' });

        wrapper.vm.move(member);

        expect(wrapper.emitted('move')[0][0]).toEqual({ direction, member });
      });

      it('should emit event move with proper direction and the member', async () => {
        const direction = 'left';
        const member = mockHouseholdCreate();

        await wrapper.setProps({ position: 'right' });

        wrapper.vm.move(member);

        expect(wrapper.emitted('move')[0][0]).toEqual({ direction, member });
      });
    });
  });
});
