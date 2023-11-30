import { createLocalVue, mount } from '@/test/testSetup';

import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { FeatureEntity } from '@libs/entities-lib/tenantSettings';
import Component from './CreateEditFeature.vue';

const localVue = createLocalVue();

const { pinia, tenantSettingsStore } = useMockTenantSettingsStore();

describe('CreateEditFeature.vue', () => {
  let wrapper;

  const doMount = async (featureId, tenantId, isEditMode) => {
    wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        loading: false,
        featureId,
        tenantId,
      },
      computed: {
        isEditMode() {
          return isEditMode;
        },
      },
    });
    await wrapper.vm.$nextTick();
  };

  describe('lifecycle', () => {
    describe('created', () => {
      it('should create a new feature when not in edit mode', async () => {
        await doMount('', '', false);
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.feature).toEqual(new FeatureEntity());
      });
      it('should load an existing feature when in edit mode', async () => {
        await doMount('id-1', '1', true);
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.feature.id).toEqual('id-1');
      });
    });
  });

  describe('methods', () => {
    describe('submit', () => {
      it('calls editFeature on the store when in edit mode', async () => {
        tenantSettingsStore.editFeature = jest.fn();
        await doMount('id-1', '1', true);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$toasted.global.success = jest.fn();
        wrapper.vm.back = jest.fn();
        await wrapper.vm.submit();
        expect(tenantSettingsStore.editFeature).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });
      it('calls createFeature on the store when not in edit mode', async () => {
        tenantSettingsStore.createFeature = jest.fn();
        await doMount('', '', false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$toasted.global.success = jest.fn();
        wrapper.vm.back = jest.fn();
        await wrapper.vm.submit();
        expect(tenantSettingsStore.createFeature).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });
    });
  });
});
