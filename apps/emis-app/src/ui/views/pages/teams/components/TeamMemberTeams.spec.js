/**
 * @group ui/components/teams
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockTeamEvents } from '@/entities/team';
import { mockStorage } from '@/store/storage';
import { mockCombinedUserAccounts } from '@/entities/user-account';
import Component from './TeamMemberTeams.vue';

const localVue = createLocalVue();
const usersTestData = mockCombinedUserAccounts();
const storage = mockStorage();

describe('TeamMemberTeams.vue', () => {
  let wrapper;

  beforeEach(() => {
    storage.userAccount.actions.fetch = jest.fn(() => usersTestData[0]);
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        member: usersTestData[0],
        show: true,
      },
      mocks: {
        $storage: storage,
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
