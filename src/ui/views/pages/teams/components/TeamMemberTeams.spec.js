import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockTeamSearchDataAggregate, Team,
} from '@/entities/team';
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
        member: new Team(mockTeamSearchDataAggregate()[0]).teamMembers[0],
        show: true,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Methods', () => {
    describe('fetchMemberTeams', () => {
      it('should call search user account fetch and assign teams', async () => {
        await wrapper.vm.fetchMemberTeams();
        expect(wrapper.vm.$storage.userAccount.actions.fetch).toHaveBeenCalledWith(wrapper.vm.member.id);
        expect(wrapper.vm.teams).toEqual(usersTestData[0].metadata.teams);
      });
    });

    describe('buildEventsString', () => {
      it('should generate empty string if array is empty', () => {
        const res = wrapper.vm.buildEventsString([]);
        expect(res).toBe('');
      });

      it('should generate the correct string', () => {
        const { events } = mockTeamSearchDataAggregate()[0];
        const res = wrapper.vm.buildEventsString(events);
        expect(res).toBe('Event 1, Event 2');
      });
    });
  });
});
