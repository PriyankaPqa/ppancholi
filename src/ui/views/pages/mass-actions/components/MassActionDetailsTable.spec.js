import {
  createLocalVue,
  mount,
} from '@/test/testSetup';

import { mockCombinedMassAction } from '@/entities/mass-action';
import Component from './MassActionDetailsTable.vue';
import { mockCombinedUserAccount } from '@/entities/user-account';

const localVue = createLocalVue();

describe('MassActionDetailsTable.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          massActionType: 'massActionType',
        },
        data() {
          return {
            userAccount: mockCombinedUserAccount(),
          };
        },
      });
    });

    describe('Template', () => {
      it('should display the type of the mass action', () => {
        expect(wrapper.findDataTest('massActionType').text()).toBe(wrapper.vm.massActionType);
      });

      it('should display the date the mass action was created', () => {
        expect(wrapper.findDataTest('dateCreated').exists()).toBe(true);
      });

      it('should display user who created the mass action', () => {
        expect(wrapper.findDataTest('createdBy').text()).toBe(mockCombinedUserAccount().metadata.displayName);
      });
    });
  });
});
