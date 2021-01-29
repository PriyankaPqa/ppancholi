import { createLocalVue, shallowMount } from '@/test/testSetup';
import RouterViewTransition from '@/ui/shared-components/RouterViewTransition.vue';
import Component from './FinancialAssistanceLayout.vue';

const localVue = createLocalVue();

describe('FinancialAssistanceLayout.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows RouterViewTransition component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(RouterViewTransition)).toBeTruthy();
    });
  });

  describe('Computed', () => {
    describe('metaTitle', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaTitle).toBe('metaInfo.financial_assistance.title');
      });
    });

    describe('metaDescription', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaDescription).toBe('metaInfo.financial_assistance.description');
      });
    });
  });
});
