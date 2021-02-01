import { createLocalVue, shallowMount } from '@/test/testSetup';
import CaseFilesTable from '@/ui/views/pages/case-files/CaseFilesTable.vue';
import TeamsTable from '@/ui/views/pages/teams/TeamsTable.vue';
import EventStats from '@/ui/views/components/stats/EventStats.vue';
import TeamStats from '@/ui/views/components/stats/TeamStats.vue';

import Component from './HomeLevel3.vue';

const localVue = createLocalVue();

describe('HomeLevel3.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows CaseFilesTable component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(CaseFilesTable)).toBeTruthy();
    });

    it('shows TeamsTable component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(TeamsTable)).toBeTruthy();
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
