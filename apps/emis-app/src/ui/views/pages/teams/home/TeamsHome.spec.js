import { createLocalVue, shallowMount } from '@/test/testSetup';
import TeamsTable from '@/ui/views/pages/teams/TeamsTable.vue';
import Component from './TeamsHome.vue';

const localVue = createLocalVue();

describe('TeamsHome.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows TeamsTable component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(TeamsTable)).toBeTruthy();
    });
  });
});
