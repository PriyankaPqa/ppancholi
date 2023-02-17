import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockTeamEvents } from '@libs/entities-lib/team';
import { mockCombinedUserAccounts } from '@libs/entities-lib/user-account';

import Component from './TeamMemberTeams.vue';

const localVue = createLocalVue();
const usersTestData = mockCombinedUserAccounts();

describe('TeamMemberTeams.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        member: usersTestData[0],
        show: true,
      },
    });
  });

  describe('Methods', () => {
    describe('buildEventsString', () => {
      it('should generate empty string if array is empty', () => {
        const res = wrapper.vm.buildEventsString([]);
        expect(res).toBe('');
      });

      it('should generate the correct string', () => {
        const res = wrapper.vm.buildEventsString(mockTeamEvents());
        expect(res).toBe('Event 1, Event 2');
      });
    });
  });
});
