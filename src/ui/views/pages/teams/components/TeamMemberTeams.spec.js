import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockTeamSearchDataAggregate, Team,
} from '@/entities/team';
import { mockStorage } from '@/store/storage';
import Component from './TeamMemberTeams.vue';

const localVue = createLocalVue();

const storage = mockStorage();

describe('TeamMemberTeams.vue', () => {
  let wrapper;

  beforeEach(() => {
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

  describe('Data', () => {
    test('orderBy', () => {
      expect(wrapper.vm.orderBy).toEqual('TeamName asc');
    });

    test('select', () => {
      expect(wrapper.vm.select).toEqual(['Events', 'TeamName', 'TeamTypeName']);
    });

    test('filter', () => {
      expect(wrapper.vm.filter).toEqual({
        TeamMembers: {
          any: {
            Id: {
              eq: wrapper.vm.member.id,
            },
          },
        },
      });
    });
  });

  describe('Methods', () => {
    describe('fetchMemberTeams', () => {
      it('should call search teams with proper params', async () => {
        await wrapper.vm.fetchMemberTeams();
        expect(wrapper.vm.$storage.team.actions.searchTeams).toHaveBeenCalledWith({
          filter: wrapper.vm.filter,
          select: wrapper.vm.select,
          orderBy: wrapper.vm.orderBy,
        });
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
