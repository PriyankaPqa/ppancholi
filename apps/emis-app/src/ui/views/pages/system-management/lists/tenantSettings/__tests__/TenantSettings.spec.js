import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import Component from '../TenantSettings.vue';
import Slug from '../Slug.vue';
import Domains from '../Domains.vue';

const localVue = createLocalVue();
let wrapper;

beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
  });
});

describe('TenantSettings.vue', () => {
  describe('>> Template', () => {
    it('should consist of Slug component', async () => {
      expect(wrapper.findComponent(Slug)).toBeTruthy();
    });

    it('should consist of Domains component', async () => {
      expect(wrapper.findComponent(Domains)).toBeTruthy();
    });
  });

  describe('>> Methods', () => {
    describe('back', () => {
      it('redirects', () => {
        wrapper.vm.back();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.systemManagement.home.name,
        });
      });
    });
  });
});
