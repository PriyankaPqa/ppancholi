import { createLocalVue, mount } from '@/test/testSetup';
import CaseFileTable from '@/ui/views/pages/case-files/CaseFilesTable.vue';
import EventStats from '@/ui/views/pages/home/components/stats/EventStats.vue';
import Component from './HomeContributorIM.vue';

const localVue = createLocalVue();

describe('HomeContributorIM.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows CaseFileTable and EventStats component', () => {
      wrapper = mount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(CaseFileTable)).toBeTruthy();
      expect(wrapper.findComponent(EventStats)).toBeTruthy();
    });
  });
});
