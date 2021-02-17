import { createLocalVue, shallowMount } from '@/test/testSetup';
import { RcRouterViewTransition } from '@crctech/component-library';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import routes from '@/constants/routes';
import Component from './SystemManagementLayout.vue';

const localVue = createLocalVue();

describe('SystemManagementLayout.vue', () => {
  let wrapper;
  beforeEach(async () => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $route: {
          name: '',
        },
      },
    });
  });

  describe('Template', () => {
    it('shows RcRouterViewTransition component', () => {
      expect(wrapper.findComponent(RcRouterViewTransition)).toBeTruthy();
    });

    it('shows PageTemplate component', () => {
      expect(wrapper.findComponent(PageTemplate)).toBeTruthy();
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

    describe('showLeftMenu', () => {
      it('return false if we are on system management home page', async () => {
        wrapper.vm.$route.name = routes.systemManagement.home.name;
        expect(wrapper.vm.showLeftMenu).toBe(false);
      });

      it('return true otherwise', async () => {
        wrapper.vm.$route.name = 'other';
        expect(wrapper.vm.showLeftMenu).toBe(true);
      });
    });
  });
});
