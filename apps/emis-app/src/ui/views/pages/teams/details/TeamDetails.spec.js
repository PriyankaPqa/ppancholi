/**
 * @group ui/components/teams
 */

/* eslint-disable */
import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import { mockTeamEvents } from '@/entities/team';

import { RcPageContent } from '@crctech/component-library';
import Component from './TeamDetails.vue';

const storage = mockStorage();
const localVue = createLocalVue();

describe('TeamDetails.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = true, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        id: 'id',
      },
      mocks: {
        $hasLevel: (lvl) => {
          return lvl <= 'level' + level;
        },
        $storage: storage,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    describe('Edit button', () => {
      it('should be enabled for L4+', async () => {

        await mountWrapper(false, 4);

        const props = wrapper.findComponent(RcPageContent).props('showEditButton');
        expect(props).toBeTruthy();
      });
      it('should be hidden for L3', async () => {

        await mountWrapper(false, 3);
        const props = wrapper.findComponent(RcPageContent).props('showEditButton');
        expect(props).toBeFalsy();
      });
    });

    describe('Elements', () => {

      beforeEach(async () => {
        await mountWrapper(false);
      });

      test('Team type', () => {
        expect(wrapper.findDataTest('team_type').text()).toBe('Standard');
      });

      test('Team Member Count', () => {
        expect(wrapper.findDataTest('team_members_count').text()).toBe('1');
      });

      test('Primary Contact', () => {
        expect(wrapper.findDataTest('team_primary_contact').text()).toBe('Jane Smith');
      });

      test('Team events', () => {
        expect(wrapper.findDataTest('team_events').text()).toBe('Event 1, Event 2');
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper(false);
    });

    describe('loadTeam', () => {
      it('should calls getTeam actions', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.$storage.team.actions.fetch).toHaveBeenLastCalledWith('id');
      });
    });

    describe('navigateToHome', () => {
      it('should redirect to team home page', async () => {
        await wrapper.vm.navigateToHome();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.teams.home.name,
        });
      });
    });

    describe('navigateToEdit', () => {
      it('should redirect to edit team with proper params', async () => {
        await wrapper.vm.navigateToEdit();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.teams.edit.name,
          params: { teamType: 'standard', id: 'id', from: wrapper.vm.$route.name },
        });
      });
    });

    describe('buildEventsString', () => {
      it('should generate empty string if array is empty', () => {
        const res = wrapper.vm.buildEventsString([]);
        expect(res).toBe('');
      });

      it('should generate the correct string', () => {
        const events = mockTeamEvents();
        const res = wrapper.vm.buildEventsString(events);
        expect(res).toBe('Event 1, Event 2');
      });
    });
  });

  describe('Computed', () => {
    describe('team', () => {
      it('should be linked to team getters team', async () => {
        await mountWrapper(false);
        expect(wrapper.vm.team).toEqual(storage.team.getters.get());
      });
    });
  });
});
