/**
 * @group ui/components/case-file
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';
import CaseFileTable from '@/ui/views/pages/case-files/CaseFilesTable.vue';
import Component from './CaseFileHome.vue';

const localVue = createLocalVue();

describe('CaseFileHome.vue', () => {
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
