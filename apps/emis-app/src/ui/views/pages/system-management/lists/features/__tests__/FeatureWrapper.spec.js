import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockFeatures } from '@libs/entities-lib/tenantSettings';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';

import Component from '../FeatureWrapper.vue';

const localVue = createLocalVue();

let wrapper;

const mockFeature = mockFeatures()[0];

const { pinia, tenantSettingsStore } = useMockTenantSettingsStore();

beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
    pinia,
    propsData: {
      feature: mockFeature,
    },
    mocks: {

    },
  });
});

describe('FeatureWrapper.vue', () => {
  describe('>> Template', () => {
    it('renders feature name', () => {
      const name = wrapper.findDataTest(`feature-name-${mockFeature.id}`);
      expect(name.text()).toBe(mockFeature.name.translation.en);
    });

    it('renders feature status switch', () => {
      const featureSwitch = wrapper.findDataTest(`feature-switch-${mockFeature.id}`);
      expect(featureSwitch.exists()).toBeTruthy();
    });

    it('renders feature description', () => {
      const description = wrapper.findDataTest(`feature-description-${mockFeature.id}`);
      expect(description.text()).toBe(mockFeature.description.translation.en);
    });
  });

  describe('>> Computed', () => {
    describe('shouldLock', () => {
      it('returns true if feature is disabled and cannot be enabled', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            feature: {
              enabled: false,
              canEnable: false,
            },
          },
        });

        expect(wrapper.vm.shouldLock).toBe(true);
      });

      it('returns true if feature is enabled and cannot be disabled', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            feature: {
              enabled: true,
              canDisable: false,
            },
          },
        });

        expect(wrapper.vm.shouldLock).toBe(true);
      });

      it('returns false in other case', () => {
        expect(wrapper.vm.shouldLock).toBe(false);
      });
    });
  });

  describe('>> Methods', () => {
    describe('onChange', () => {
      it('calls confirmBeforeChange if can no longer be enabled', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            feature: {
              enabled: true,
              canEnable: false,
            },
          },
        });

        wrapper.vm.confirmBeforeChange = jest.fn();
        wrapper.vm.change = jest.fn();

        await wrapper.vm.onChange(false);

        expect(wrapper.vm.confirmBeforeChange).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.confirmBeforeChange).toHaveBeenCalledWith(false);
        expect(wrapper.vm.change).toHaveBeenCalledTimes(0);
      });

      it('calls confirmBeforeChange if can no longer be disabled', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            feature: {
              enabled: false,
              canDisable: false,
            },
          },
        });

        wrapper.vm.confirmBeforeChange = jest.fn();
        wrapper.vm.change = jest.fn();

        await wrapper.vm.onChange(true);

        expect(wrapper.vm.confirmBeforeChange).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.confirmBeforeChange).toHaveBeenCalledWith(true);
        expect(wrapper.vm.change).toHaveBeenCalledTimes(0);
      });

      it('calls change in other case', async () => {
        wrapper.vm.confirmBeforeChange = jest.fn();
        wrapper.vm.change = jest.fn();

        await wrapper.vm.onChange(false);

        expect(wrapper.vm.confirmBeforeChange).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.change).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.change).toHaveBeenCalledWith(false);
      });
    });

    describe('confirmBeforeChange', () => {
      it('calls change if user confirmed', async () => {
        wrapper.vm.$confirm = jest.fn(() => true);
        await wrapper.setData({ enabled: false });
        wrapper.vm.change = jest.fn();

        await wrapper.vm.confirmBeforeChange(true);

        expect(wrapper.vm.change).toHaveBeenCalledWith(true);
        expect(wrapper.vm.enabled = false);
      });

      it('rolls back if user did not confirm', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.setData({ enabled: true });
        wrapper.vm.change = jest.fn();

        await wrapper.vm.confirmBeforeChange(true);

        expect(wrapper.vm.change).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.enabled = false);
      });
    });

    describe('change', () => {
      it('calls the store to enable feature', async () => {
        await wrapper.vm.change(true);

        expect(tenantSettingsStore.enableFeature).toHaveBeenCalledTimes(1);
        expect(tenantSettingsStore.enableFeature).toHaveBeenCalledWith(mockFeature.id);
      });

      it('calls the store to disable feature', async () => {
        await wrapper.vm.change(false);

        expect(tenantSettingsStore.disableFeature).toHaveBeenCalledTimes(1);
        expect(tenantSettingsStore.disableFeature).toHaveBeenCalledWith(mockFeature.id);
      });

      it('roll back data if request failed', async () => {
        tenantSettingsStore.enableFeature.mockReturnValueOnce(null);

        await wrapper.vm.change(true);

        expect(wrapper.vm.enabled).toBe(false);
      });
    });
  });
});
