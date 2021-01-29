import { createLocalVue, shallowMount } from '@/test/testSetup';
import RouterViewTransition from '@/ui/shared-components/RouterViewTransition.vue';
import Component from './SystemManagementLayout.vue';

const localVue = createLocalVue();

describe('SystemManagementLayout.vue', () => {
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
        expect(wrapper.vm.metaTitle).toBe('metaInfo.dashboard.system_management.title');
      });
    });

    describe('metaDescription', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaDescription).toBe('metaInfo.dashboard.system_management.description');
      });
    });
  });
});
