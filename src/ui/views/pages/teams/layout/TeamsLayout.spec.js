/**
 * @group ui/components/teams
 */

import { RcRouterViewTransition } from '@crctech/component-library';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './TeamsLayout.vue';

const localVue = createLocalVue();

describe('TeamsLayout.vue', () => {
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
        expect(wrapper.vm.metaTitle).toBe('metaInfo.team_management.title');
      });
    });

    describe('metaDescription', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaDescription).toBe('metaInfo.team_management.description');
      });
    });
  });
});
