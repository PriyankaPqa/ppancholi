/**
 * @group ui/components/assessments
 */

import { RcRouterViewTransition } from '@crctech/component-library';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './AssessmentsLayout.vue';

const localVue = createLocalVue();

describe('AssessmentsLayout.vue', () => {
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
