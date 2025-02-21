import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { FeatureType } from '@libs/entities-lib/tenantSettings';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';

import Component from '../Features.vue';

const localVue = createLocalVue();

let wrapper;

const { pinia, tenantSettingsStore } = useMockTenantSettingsStore();
beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
    pinia,
  });
});

describe('Features.vue', () => {
  describe('>> Template', () => {
    it('renders temporary features and permanent features', () => {
      const temporaryFeaturesComponent = wrapper.findDataTest('temporary-features');
      expect(temporaryFeaturesComponent.exists()).toBeTruthy();

      const permanentFeaturesComponent = wrapper.findDataTest('permanent-features');
      expect(permanentFeaturesComponent.exists()).toBeTruthy();
    });
  });

  describe('>> Computed', () => {
    describe('temporaryFeatures', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.temporaryFeatures).toEqual(
          tenantSettingsStore.currentTenantSettings.features.filter((f) => f.type === FeatureType.Temporary),
        );
      });
    });

    describe('permanentFeatures', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.permanentFeatures).toEqual(
          tenantSettingsStore.currentTenantSettings.features.filter((f) => f.type === FeatureType.Permanent),
        );
      });
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
