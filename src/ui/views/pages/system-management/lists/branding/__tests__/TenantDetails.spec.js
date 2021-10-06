import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockBrandingEntity } from '@/entities/branding';
import entityUtils from '@/entities/utils';
import { mockStorage } from '@/store/storage';
import Component from '../TenantDetails.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
    propsData: {
      disableEditBtn: false,
    },
    mocks: {
      $storage: storage,
    },
  });
});

describe('TenantDetails.vue', () => {
  describe('Template', () => {
    describe('visibility of view tenant details', () => {
      it('is visible if not edit mode', async () => {
        await wrapper.setData({
          isEditing: false,
        });

        expect(wrapper.findDataTest('view-tenant-details').exists()).toBeTruthy();
      });

      it('is not visible in edit mode', async () => {
        await wrapper.setData({
          isEditing: true,
        });

        expect(wrapper.findDataTest('view-tenant-details').exists()).toBeFalsy();
      });
    });

    describe('visibility of edit tenant details', () => {
      it('is not visible if not edit mode', async () => {
        await wrapper.setData({
          isEditing: false,
        });

        expect(wrapper.findDataTest('edit-tenant-details').exists()).toBeFalsy();
      });

      it('is visible in edit mode', async () => {
        await wrapper.setData({
          isEditing: true,
        });

        expect(wrapper.findDataTest('edit-tenant-details').exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('tenantDetails', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.tenantDetails).toEqual(storage.branding.getters.branding());
      });
    });
  });

  describe('>> Methods', () => {
    describe('setLanguageMode', () => {
      it('sets languageMode', async () => {
        await wrapper.setData({
          tempTenantDetails: mockBrandingEntity(),
        });

        wrapper.vm.setLanguageMode('fr');

        expect(wrapper.vm.languageMode).toBe('fr');
      });

      it('fills empty multilingual fields', async () => {
        await wrapper.setData({
          tempTenantDetails: mockBrandingEntity(),
        });

        jest.spyOn(entityUtils, 'getFilledMultilingualField');

        wrapper.vm.setLanguageMode('fr');

        expect(entityUtils.getFilledMultilingualField).toHaveBeenCalledTimes(1);
      });
    });

    describe('enterEditMode', () => {
      it('sets isEditing', async () => {
        wrapper.vm.enterEditMode();

        expect(wrapper.vm.isEditing).toBeTruthy();
      });

      it('emits event', async () => {
        wrapper.vm.enterEditMode();

        expect(wrapper.emitted('update:is-editing-tenant-details')[0][0]).toEqual(true);
      });
    });

    describe('exitEditMode', () => {
      it('sets isEditing', async () => {
        wrapper.vm.exitEditMode();

        expect(wrapper.vm.isEditing).toBeFalsy();
      });

      it('emits event', async () => {
        wrapper.vm.exitEditMode();

        expect(wrapper.emitted('update:is-editing-tenant-details')[0][0]).toEqual(false);
      });
    });

    describe('submit', () => {
      it('calls getFilledMultilingualField', async () => {
        jest.spyOn(entityUtils, 'getFilledMultilingualField');

        await wrapper.setData({
          tempTenantDetails: mockBrandingEntity(),
        });

        await wrapper.vm.submit();

        expect(entityUtils.getFilledMultilingualField).toHaveBeenCalledTimes(2);
      });

      it('builds request and calls storage to update tenant details', async () => {
        jest.clearAllMocks();

        await wrapper.setData({
          tempTenantDetails: mockBrandingEntity(),
        });

        await wrapper.vm.submit();

        expect(storage.branding.actions.updateTenantDetails).toHaveBeenCalledWith({
          ...mockBrandingEntity(),
          hideName: !mockBrandingEntity().showName,
        });
      });
    });
  });
});
