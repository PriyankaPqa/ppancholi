import { RcRouterViewTransition } from '@crctech/component-library';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './CaseFileLayout.vue';

const localVue = createLocalVue();

describe('CaseFileLayout.vue', () => {
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
        expect(wrapper.vm.metaTitle).toBe('metaInfo.dashboard_caseFile.title');
      });
    });

    describe('metaDescription', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaDescription).toBe('metaInfo.dashboard_caseFile.description');
      });
    });
  });
});
