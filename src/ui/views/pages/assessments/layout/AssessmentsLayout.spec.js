import { createLocalVue, shallowMount } from '@/test/testSetup';
import RouterViewTransition from '@/ui/shared-components/RouterViewTransition.vue';
import Component from './AssessmentsLayout.vue';

const localVue = createLocalVue();

describe('AssessmentsLayout.vue', () => {
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
        expect(wrapper.vm.metaTitle).toBe('metaInfo.assessments.title');
      });
    });

    describe('metaDescription', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaDescription).toBe('metaInfo.assessments.description');
      });
    });
  });
});
