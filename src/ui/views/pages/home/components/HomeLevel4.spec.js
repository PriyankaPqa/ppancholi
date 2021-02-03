import { createLocalVue, shallowMount } from '@/test/testSetup';
import TeamsTable from '@/ui/views/pages/teams/TeamsTable.vue';
import EventStats from '@/ui/views/components/stats/EventStats.vue';
import TeamStats from '@/ui/views/components/stats/TeamStats.vue';

import Component from './HomeLevel4.vue';

const localVue = createLocalVue();

describe('HomeLevel4.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows TeamsTable component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(TeamsTable)).toBeTruthy();
    });

    it('TeamsTable title is linked to the proper key', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(TeamsTable).props('title')).toBe('common.myTeams');
    });

    it('shows EventStats component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(EventStats)).toBeTruthy();
    });

    it('shows TeamStats component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(TeamStats)).toBeTruthy();
    });
  });
});
