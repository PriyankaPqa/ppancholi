import { createLocalVue, shallowMount } from '@/test/testSetup';
import TeamsTable from '@/ui/views/pages/teams/TeamsTable.vue';
import EventStats from '@/ui/views/pages/home/components/stats/EventStats.vue';
import TeamStats from '@/ui/views/pages/home/components/stats/TeamStats.vue';

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

    it('TeamsTable isOnHomepage prop has the right value', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(TeamsTable).props('isOnHomepage')).toBeTruthy();
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
