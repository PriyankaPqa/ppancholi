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

  describe('>> Computed', () => {
    describe('isEditing', () => {
      it('returns correct value', async () => {
        await wrapper.setData({
          isEditingSlug: true,
          isEditingDomains: false,
        });

        expect(wrapper.vm.isEditing).toBeTruthy();

        await wrapper.setData({
          isEditingSlug: false,
          isEditingDomains: false,
        });

        expect(wrapper.vm.isEditing).toBeFalsy();
      });
    });
  });

  describe('>> Methods', () => {
    describe('back', () => {
      it('redirects', () => {
        wrapper.vm.$router = {
          replace: jest.fn(),
        };

        wrapper.vm.back();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.systemManagement.home.name,
        });
      });
    });
  });
});
