import { createLocalVue, shallowMount } from '@/test/testSetup';
import { RcRouterViewTransition } from '@crctech/component-library';
import Component from './MassActionsLayout.vue';

const localVue = createLocalVue();

describe('MassActionsLayout.vue', () => {
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
        expect(wrapper.vm.metaTitle).toBe('metaInfo.mass_actions.title');
      });
    });

    describe('metaDescription', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaDescription).toBe('metaInfo.mass_actions.description');
      });
    });
  });
});
