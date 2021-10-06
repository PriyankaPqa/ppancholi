import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import Component from '../Branding.vue';
import Colours from '../Colours.vue';
import Logo from '../Logo.vue';
import TenantDetails from '../TenantDetails.vue';

const localVue = createLocalVue();
let wrapper;

beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
  });
});

describe('Branding.vue', () => {
  describe('>> Template', () => {
    it('should consist of Colours component', async () => {
      expect(wrapper.findComponent(Colours)).toBeTruthy();
    });

    it('should consist of Logo component', async () => {
      expect(wrapper.findComponent(Logo)).toBeTruthy();
    });

    it('should consist of TenantDetails component', async () => {
      expect(wrapper.findComponent(TenantDetails)).toBeTruthy();
    });
  });

  describe('>> Computed', () => {
    describe('disableEditBtn', () => {
      it('returns correct value', async () => {
        await wrapper.setData({
          isEditingColours: true,
          isEditingTenantDetails: false,
        });

        expect(wrapper.vm.disableEditBtn).toBeTruthy();

        await wrapper.setData({
          isEditingColours: false,
          isEditingTenantDetails: false,
        });

        expect(wrapper.vm.disableEditBtn).toBeFalsy();
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
