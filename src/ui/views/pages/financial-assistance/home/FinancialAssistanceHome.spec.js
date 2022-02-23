/**
 * @group ui/components/financial-assistance
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';
import FinancialAssistanceTablesTable from '@/ui/views/pages/financial-assistance/FinancialAssistanceTablesTable.vue';
import Component from './FinancialAssistanceHome.vue';

const localVue = createLocalVue();

describe('FinancialAssistanceHome.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows FinancialAssistanceTablesTable component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(FinancialAssistanceTablesTable)).toBeTruthy();
    });
  });
});
