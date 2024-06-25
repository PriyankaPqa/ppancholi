import { createLocalVue, shallowMount } from '@/test/testSetup';
import CaseFileTable from '@/ui/views/pages/case-files/CaseFilesTable.vue';
import Component from './DashboardCaseFile.vue';

const localVue = createLocalVue();

describe('DashboardCaseFile.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows CaseFileTable component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(CaseFileTable)).toBeTruthy();
    });
  });
});
