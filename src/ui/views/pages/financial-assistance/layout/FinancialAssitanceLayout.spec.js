import { createLocalVue, shallowMount } from '@/test/testSetup';
import { RcRouterViewTransition } from '@rctech/component-library';
import Component from './FinancialAssistanceLayout.vue';

const localVue = createLocalVue();

describe('FinancialAssistanceLayout.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows RcRouterViewTransition component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(RcRouterViewTransition)).toBeTruthy();
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
