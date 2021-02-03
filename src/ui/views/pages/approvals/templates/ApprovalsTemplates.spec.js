import { createLocalVue, mount } from '@/test/testSetup';
import ApprovalsTable from '@/ui/views/pages/approvals/ApprovalsTable.vue';
import Component from './ApprovalsTemplates.vue';

const localVue = createLocalVue();

describe('ApprovalsHome.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows ApprovalsTable component', () => {
      wrapper = mount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(ApprovalsTable)).toBeTruthy();
    });
  });
});
