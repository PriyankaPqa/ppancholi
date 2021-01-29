import { createLocalVue, shallowMount } from '@/test/testSetup';
import FinancialAssistanceTemplatesTable from '@/ui/views/pages/financial-assistance/FinancialAssistanceTemplatesTable.vue';
import Component from './FinancialAssistanceHome.vue';

const localVue = createLocalVue();

describe('FinancialAssistanceHome.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows FinancialAssistanceTemplatesTable component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(FinancialAssistanceTemplatesTable)).toBeTruthy();
    });
  });
});
