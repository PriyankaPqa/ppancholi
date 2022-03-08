import { createLocalVue, shallowMount } from '@/test/testSetup';
import EventsTable from '@/ui/views/pages/events/EventsTable.vue';
import EventStats from '@/ui/views/pages/home/components/stats/EventStats.vue';
import TeamStats from '@/ui/views/pages/home/components/stats/TeamStats.vue';

import Component from './HomeLevel5.vue';

const localVue = createLocalVue();

describe('HomeLevel5.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows EventsTable component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(EventsTable)).toBeTruthy();
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
