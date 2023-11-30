import { createLocalVue, mount } from '@/test/testSetup';

import { FeatureType, mockTenantSettingsEntities } from '@libs/entities-lib/tenantSettings';
import Component from './MultiTenantFeaturesTable.vue';

const localVue = createLocalVue();

const mockTenantSettings = mockTenantSettingsEntities();

function mockFeatureViews() {
  const featureViews = [
    {
      key: 'feature key-1',
      name: 'Feature One',
      age: '100',
      type: FeatureType.Temporary,
      tenantMap: new Map(),
    },
    {
      key: 'feature key-2',
      name: 'Feature Two',
      age: '100',
      type: FeatureType.Temporary,
      tenantMap: new Map(),
    },
  ];
  featureViews[0].tenantMap.set(mockTenantSettings[0].id, mockTenantSettings[0].features[0]);
  featureViews[0].tenantMap.set(mockTenantSettings[1].id, mockTenantSettings[1].features[0]);
  featureViews[1].tenantMap.set(mockTenantSettings[0].id, mockTenantSettings[0].features[1]);
  featureViews[1].tenantMap.set(mockTenantSettings[1].id, mockTenantSettings[1].features[1]);

  return featureViews;
}

describe('MultiTenantFeaturesTable.vue', () => {
  let wrapper;

  const doMount = async (featureViews) => {
    const items = featureViews ?? mockFeatureViews();
    wrapper = mount(Component, {
      localVue,
      propsData: {
        features: items,
        tenants: mockTenantSettings,
        searchText: '',
      },
    });
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    let localFeatureViews;
    beforeEach(async () => {
      localFeatureViews = mockFeatureViews();
      localFeatureViews[0].tenantMap.get('1').enabled = true;
      localFeatureViews[0].tenantMap.get('2').enabled = true;
      localFeatureViews[1].tenantMap.get('1').enabled = false;
      localFeatureViews[1].tenantMap.get('2').enabled = false;
      await doMount(localFeatureViews);
    });
    describe('feature enabled status', () => {
      it('is correct for all features', () => {
        expect(wrapper.findDataTest('feature-enabled-id-1-1').text()).toEqual('system_management.features.on');
        expect(wrapper.findDataTest('feature-enabled-id-2-1').text()).toEqual('system_management.features.off');
        expect(wrapper.findDataTest('feature-enabled-id-1-2').text()).toEqual('system_management.features.on');
        expect(wrapper.findDataTest('feature-enabled-id-2-2').text()).toEqual('system_management.features.off');
      });
    });
    describe('feature enable/disable button', () => {
      it('is correct for all features', () => {
        expect(wrapper.findDataTest('feature-disable-btn-id-1-1').exists()).toBeTruthy();
        expect(wrapper.findDataTest('feature-enable-btn-id-1-1').exists()).toBeFalsy();
        expect(wrapper.findDataTest('feature-disable-btn-id-2-1').exists()).toBeFalsy();
        expect(wrapper.findDataTest('feature-enable-btn-id-2-1').exists()).toBeTruthy();
        expect(wrapper.findDataTest('feature-disable-btn-id-1-2').exists()).toBeTruthy();
        expect(wrapper.findDataTest('feature-enable-btn-id-1-2').exists()).toBeFalsy();
        expect(wrapper.findDataTest('feature-disable-btn-id-2-2').exists()).toBeFalsy();
        expect(wrapper.findDataTest('feature-enable-btn-id-2-2').exists()).toBeTruthy();
      });
    });
  });

  describe('computed', () => {
    beforeEach(async () => {
      await doMount();
    });
    describe('filteredFeatures', () => {
      it('contains the expected set of features', () => {
        expect(wrapper.vm.filteredFeatures.length).toEqual(2);
        expect(wrapper.vm.filteredFeatures.find((f) => f.key === 'feature key-1')).toBeTruthy();
        expect(wrapper.vm.filteredFeatures.find((f) => f.key === 'feature key-2')).toBeTruthy();
      });
      it('contains entries for each tenant on each feature', () => {
        expect(wrapper.vm.filteredFeatures[0].tenantMap.size).toEqual(2);
        expect(wrapper.vm.filteredFeatures[1].tenantMap.size).toEqual(2);
      });
    });
  });

  describe('methods', () => {
    beforeEach(async () => {
      await doMount();
    });
    describe('toggleEnabled', () => {
      it('emits expected event', () => {
        const tenant = wrapper.vm.tenants[0];
        const feature = wrapper.vm.features[0];
        wrapper.vm.$emit = jest.fn();
        wrapper.vm.toggleEnabled(true, tenant, feature);
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('toggleEnabled', {
          isEnabled: true,
          feature,
          tenant,
        });
      });
    });
    describe('editFeature', () => {
      it('emits expected event', () => {
        const tenant = wrapper.vm.tenants[0];
        const feature = wrapper.vm.features[0];
        wrapper.vm.$emit = jest.fn();
        wrapper.vm.editFeature(tenant, feature);
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('editFeature', {
          feature,
          tenant,
        });
      });
    });
    describe('deleteFeature', () => {
      it('emits expected event', () => {
        const feature = wrapper.vm.features[0];
        wrapper.vm.$emit = jest.fn();
        wrapper.vm.deleteFeature(feature);
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('deleteFeature', {
          feature,
          tenant: null,
        });
      });
    });
  });
});
