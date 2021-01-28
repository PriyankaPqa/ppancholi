import { createLocalVue, mount } from '@/test/testSetup';
import CaseFileTable from '@/ui/views/components/CaseFileTable.vue';
import Component from './HomeLevel1.vue';

const localVue = createLocalVue();

describe('HomeLevel1.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows CaseFileTable component', () => {
      wrapper = mount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(CaseFileTable)).toBeTruthy();
    });
  });
});
