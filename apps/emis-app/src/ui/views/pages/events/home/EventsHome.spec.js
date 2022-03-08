import { createLocalVue, shallowMount } from '@/test/testSetup';
import EventsTable from '@/ui/views/pages/events/EventsTable.vue';
import Component from './EventsHome.vue';

const localVue = createLocalVue();

describe('EventsHome.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows EventsTable component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(EventsTable)).toBeTruthy();
    });
  });
});
