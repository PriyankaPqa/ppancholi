import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';

import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { mockTenantSettingsEntities } from '@libs/entities-lib/tenantSettings';
import Component from './MultiTenantFeatures.vue';

const localVue = createLocalVue();

const { pinia, tenantSettingsStore } = useMockTenantSettingsStore();

const mockTenantSettings = mockTenantSettingsEntities();

describe('MultiTenantFeatures.vue', () => {
  let wrapper;

  const doMount = async (tenantSettings) => {
    const items = tenantSettings ?? mockTenantSettings;
    wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        loading: false,
      },
      computed: {
        allTenants() {
          return items;
        },
      },
    });
    await wrapper.vm.$nextTick();
  };

  describe('computed', () => {
    beforeEach(async () => {
      await doMount();
    });
    describe('allTenants', () => {
      it('returns test tenants', () => {
        expect(wrapper.vm.allTenants.length).toEqual(2);
      });
    });
    describe('allFeatures', () => {
      it('contains the expected set of features', () => {
        expect(wrapper.vm.allFeatures.size).toEqual(2);
        expect(wrapper.vm.allFeatures.get('feature key-1')).toBeTruthy();
        expect(wrapper.vm.allFeatures.get('feature key-2')).toBeTruthy();
      });
      it('contains entries for each tenant on each feature', () => {
        expect(wrapper.vm.allFeatures.get('feature key-1').size).toEqual(2);
        expect(wrapper.vm.allFeatures.get('feature key-2').size).toEqual(2);
      });
    });
    describe('featureArray', () => {
      it('contains feature views for each feature', () => {
        expect(wrapper.vm.featureArray.length).toEqual(2);
      });
    });
  });

  describe('methods', () => {
    beforeEach(async () => {
      await doMount();
    });
    describe('onToggleEnabled', () => {
      it('sets data for confirmation when enabling feature', () => {
        expect(wrapper.vm.showEnableConfirmationDialog).toBeFalsy();
        const tenant = mockTenantSettings[0];
        const feature = wrapper.vm.featureArray[0];
        wrapper.vm.onToggleEnabled({ isEnabled: true, tenant, feature });
        expect(wrapper.vm.selectedTenant).toEqual(tenant);
        expect(wrapper.vm.selectedFeature).toEqual(feature);
        expect(wrapper.vm.selectedToEnable).toBeTruthy();
        expect(wrapper.vm.showEnableConfirmationDialog).toBeTruthy();
      });
      it('sets data for confirmation when disabling feature', () => {
        expect(wrapper.vm.showEnableConfirmationDialog).toBeFalsy();
        const tenant = mockTenantSettings[0];
        const feature = wrapper.vm.featureArray[0];
        wrapper.vm.onToggleEnabled({ isEnabled: false, tenant, feature });
        expect(wrapper.vm.selectedTenant).toEqual(tenant);
        expect(wrapper.vm.selectedFeature).toEqual(feature);
        expect(wrapper.vm.selectedToEnable).toBeFalsy();
        expect(wrapper.vm.showEnableConfirmationDialog).toBeTruthy();
      });
    });
    describe('setEnabled', () => {
      it('calls enableFeature on the store when enabling', async () => {
        tenantSettingsStore.setFeatureEnabled = jest.fn();
        await wrapper.setData({
          selectedTenant: mockTenantSettings[0],
          selectedFeature: wrapper.vm.featureArray[0],
          selectedToEnable: true,
          showEnableConfirmationDialog: true,
        });
        await wrapper.vm.setEnabled();
        expect(tenantSettingsStore.setFeatureEnabled).toHaveBeenCalledWith(true, 'feature key-1', '1');
        expect(wrapper.vm.showEnableConfirmationDialog).toBeFalsy();
      });
      it('calls disableFeature on the store when disabling', async () => {
        tenantSettingsStore.setFeatureEnabled = jest.fn();
        await wrapper.setData({
          selectedTenant: mockTenantSettings[0],
          selectedFeature: wrapper.vm.featureArray[0],
          selectedToEnable: false,
          showEnableConfirmationDialog: true,
        });
        await wrapper.vm.setEnabled();
        expect(tenantSettingsStore.setFeatureEnabled).toHaveBeenCalledWith(false, 'feature key-1', '1');
        expect(wrapper.vm.showEnableConfirmationDialog).toBeFalsy();
      });
    });
    describe('addFeature', () => {
      it('navigates to the expected route', () => {
        wrapper.vm.addFeature();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.systemManagement.multiTenantFeatures.create.name,
        });
      });
    });
    describe('onEditFeature', () => {
      it('navigates to the expected route', () => {
        wrapper.vm.onEditFeature({ tenant: mockTenantSettings[0], feature: wrapper.vm.featureArray[0] });
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.systemManagement.multiTenantFeatures.edit.name,
          params: {
            featureId: 'id-1',
            tenantId: '1',
          },
        });
      });
    });
    describe('onDeleteFeature', () => {
      it('sets data and displays confirmation dialog', () => {
        expect(wrapper.vm.showDeleteConfirmationDialog).toBeFalsy();
        const feature = wrapper.vm.featureArray[0];
        wrapper.vm.onDeleteFeature({ feature });
        expect(wrapper.vm.selectedFeature).toEqual(feature);
        expect(wrapper.vm.showDeleteConfirmationDialog).toBeTruthy();
      });
    });
    describe('deleteFeature', () => {
      it('calls delete on the store with the selected feature and all tenants', async () => {
        tenantSettingsStore.removeFeature = jest.fn();
        const feature = wrapper.vm.featureArray[0];
        await wrapper.setData({
          selectedFeature: feature,
          showDeleteConfirmationDialog: true,
        });
        await wrapper.vm.deleteFeature();
        expect(tenantSettingsStore.removeFeature).toHaveBeenCalledWith({
          key: feature.key,
          tenantIds: ['1', '2'],
        });
        expect(wrapper.vm.showDeleteConfirmationDialog).toBeFalsy();
      });
    });
  });
});
