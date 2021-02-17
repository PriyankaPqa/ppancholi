import { createLocalVue, shallowMount } from '@/test/testSetup';
import { RcRouterViewTransition } from '@crctech/component-library';
import Component from './ReportsLayout.vue';

const localVue = createLocalVue();

describe('ReportsLayout.vue', () => {
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
        expect(wrapper.vm.metaTitle).toBe('metaInfo.reports.title');
      });
    });

    describe('metaDescription', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaDescription).toBe('metaInfo.reports.description');
      });
    });
  });
});
