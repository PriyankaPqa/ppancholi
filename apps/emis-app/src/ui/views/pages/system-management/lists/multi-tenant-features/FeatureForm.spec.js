import { createLocalVue, shallowMount } from '@/test/testSetup';
import { MAX_LENGTH_SM, MAX_LENGTH_MD, MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';

import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { mockFeatures, FeatureType, FeatureVisibility } from '@libs/entities-lib/tenantSettings';

import Component from './FeatureForm.vue';

const { pinia } = useMockTenantSettingsStore();
const localVue = createLocalVue();
const mockFeature = mockFeatures()[0];

describe('FeatureForm.vue', () => {
  let wrapper;

  const doMount = (feature) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        isEditMode: true,
        feature: feature ?? mockFeature,
        isDirty: false,
      },
    };
    wrapper = shallowMount(Component, options);
  };

  describe('Computed', () => {
    beforeEach(() => {
      doMount();
    });
    describe('rules', () => {
      it('is defined properly', () => {
        expect(wrapper.vm.rules).toEqual({
          name: {
            required: true,
            max: MAX_LENGTH_MD,
          },
          description: {
            required: true,
            max: MAX_LENGTH_LG,
          },
          key: {
            required: true,
            max: MAX_LENGTH_SM,
          },
        });
      });
    });
    describe('featureTypes', () => {
      it('contains Permanent and Temporary items', () => {
        expect(wrapper.vm.featureTypes.find((ft) => ft.value === FeatureType.Permanent)).toBeTruthy();
        expect(wrapper.vm.featureTypes.find((ft) => ft.value === FeatureType.Temporary)).toBeTruthy();
      });
    });
    describe('featureVisibilities', () => {
      it('contains Public and Private items', () => {
        expect(wrapper.vm.featureVisibilities.find((fv) => fv.value === FeatureVisibility.Public)).toBeTruthy();
        expect(wrapper.vm.featureVisibilities.find((fv) => fv.value === FeatureVisibility.Private)).toBeTruthy();
      });
    });
  });
});
