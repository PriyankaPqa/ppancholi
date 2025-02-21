import { createLocalVue, shallowMount } from '@/test/testSetup';
import entityUtils from '@libs/entities-lib/utils';
import { MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import { mockTenantSettingsEntity } from '@libs/entities-lib/tenantSettings';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';

import Component from '../Domains.vue';

const localVue = createLocalVue();

let wrapper;

const { pinia, tenantSettingsStore } = useMockTenantSettingsStore();

beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
    pinia,
    propsData: {
      disableEditBtn: false,
    },
  });
});

describe('Domains.vue', () => {
  describe('Template', () => {
    describe('visibility of view domains', () => {
      it('is visible if not edit mode', async () => {
        await wrapper.setData({
          isEditing: false,
        });

        expect(wrapper.findDataTest('view-domains').exists()).toBeTruthy();
      });

      it('is not visible in edit mode', async () => {
        await wrapper.setData({
          isEditing: true,
        });

        expect(wrapper.findDataTest('view-domains').exists()).toBeFalsy();
      });
    });

    describe('visibility of edit domains', () => {
      it('is not visible if not edit mode', async () => {
        await wrapper.setData({
          isEditing: false,
        });

        expect(wrapper.findDataTest('edit-domains').exists()).toBeFalsy();
      });

      it('is visible in edit mode', async () => {
        await wrapper.setData({
          isEditing: true,
        });

        expect(wrapper.findDataTest('edit-domains').exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('hasNoSlug', () => {
      it('returns correct value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            disableEditBtn: false,
          },

        });

        expect(wrapper.vm.hasNoSlug).toBeFalsy();

        tenantSettingsStore.currentTenantSettings = {};

        expect(wrapper.vm.hasNoSlug).toBeTruthy();
      });
    });

    describe('emisDomain', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.emisDomain).toEqual(tenantSettingsStore.currentTenantSettings.emisDomain);
      });
    });

    describe('registrationDomain', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.registrationDomain).toEqual(tenantSettingsStore.currentTenantSettings.registrationDomain);
      });
    });

    describe('rules', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.rules).toEqual({
          required: true,
          max: MAX_LENGTH_SM,
        });
      });
    });

    describe('isDirty', () => {
      it('returns false if tempEmisDomain and tempRegistrationDomain is the same from storage', async () => {
        const testEmisDomain = 'emis';
        const testRegistrationDomain = 'registration';

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            emisDomain() {
              return testEmisDomain;
            },
            registrationDomain() {
              return testRegistrationDomain;
            },
          },

        });

        await wrapper.setData({
          tempEmisDomain: testEmisDomain,
          tempRegistrationDomain: testRegistrationDomain,
          isEditing: true,
        });

        expect(wrapper.vm.isDirty).toBe(false);
      });

      it('returns false if isEditing is false', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            emisDomain() {
              return 'emis-1';
            },
            registrationDomain() {
              return 'registration-1';
            },
          },

        });

        await wrapper.setData({
          tempEmisDomain: 'emis 2',
          tempRegistrationDomain: 'registration-2',
          isEditing: false,
        });

        expect(wrapper.vm.isDirty).toBe(false);
      });

      it('returns true if tempEmisDomain is different than storage', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            emisDomain() {
              return 'emis-1';
            },
            registrationDomain() {
              return 'registration-1';
            },
          },

        });

        await wrapper.setData({
          tempEmisDomain: 'emis 2',
          tempRegistrationDomain: 'registration-2',
          isEditing: true,
        });

        expect(wrapper.vm.isDirty).toBe(true);
      });
    });
  });

  describe('>> Methods', () => {
    describe('setLanguageMode', () => {
      it('sets languageMode', async () => {
        await wrapper.setData({
          tempEmisDomain: mockTenantSettingsEntity().emisDomain,
          tempRegistrationDomain: mockTenantSettingsEntity().registrationDomain,
        });

        wrapper.vm.setLanguageMode('fr');

        expect(wrapper.vm.languageMode).toBe('fr');
      });

      it('fills empty multilingual fields', async () => {
        await wrapper.setData({
          tempEmisDomain: mockTenantSettingsEntity().emisDomain,
          tempRegistrationDomain: mockTenantSettingsEntity().registrationDomain,
        });

        jest.spyOn(entityUtils, 'getFilledMultilingualField');

        wrapper.vm.setLanguageMode('fr');

        expect(entityUtils.getFilledMultilingualField).toHaveBeenCalledTimes(2);
      });
    });

    describe('enterEditMode', () => {
      it('sets isEditing', async () => {
        wrapper.vm.resetDomains = jest.fn();

        wrapper.vm.enterEditMode();

        expect(wrapper.vm.isEditing).toBeTruthy();
      });

      it('resets domain', async () => {
        wrapper.vm.resetDomains = jest.fn();

        wrapper.vm.enterEditMode();

        expect(wrapper.vm.resetDomains).toHaveBeenCalledTimes(1);
      });

      it('emits event', async () => {
        wrapper.vm.resetDomains = jest.fn();

        wrapper.vm.enterEditMode();

        expect(wrapper.emitted('update:is-editing')[0][0]).toEqual(true);
      });
    });

    describe('exitEditMode', () => {
      it('sets isEditing', async () => {
        wrapper.vm.resetDomains = jest.fn();

        wrapper.vm.exitEditMode();

        expect(wrapper.vm.isEditing).toBeFalsy();
      });

      it('resets domain', async () => {
        wrapper.vm.resetDomains = jest.fn();

        wrapper.vm.enterEditMode();

        expect(wrapper.vm.resetDomains).toHaveBeenCalledTimes(1);
      });

      it('emits event', async () => {
        wrapper.vm.resetDomains = jest.fn();

        wrapper.vm.exitEditMode();

        expect(wrapper.emitted('update:is-editing')[0][0]).toEqual(false);
      });
    });

    describe('submit', () => {
      it('calls getFilledMultilingualField', async () => {
        jest.spyOn(entityUtils, 'getFilledMultilingualField');

        await wrapper.setData({
          tempEmisDomain: mockTenantSettingsEntity().emisDomain,
          tempRegistrationDomain: mockTenantSettingsEntity().registrationDomain,
        });

        await wrapper.vm.submit();

        expect(entityUtils.getFilledMultilingualField).toHaveBeenCalledTimes(2);
      });

      it('builds request and calls the store to update tenant settings', async () => {
        jest.clearAllMocks();

        const { emisDomain } = mockTenantSettingsEntity();
        const { registrationDomain } = mockTenantSettingsEntity();

        await wrapper.setData({
          tempEmisDomain: emisDomain,
          tempRegistrationDomain: registrationDomain,
        });

        await wrapper.vm.submit();

        expect(tenantSettingsStore.createTenantDomains).toHaveBeenCalledWith({
          emis: emisDomain,
          registration: registrationDomain,
        });
      });
    });

    describe('cancel', () => {
      it('pop confirmation dialog', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            isDirty() {
              return true;
            },
          },

        });

        wrapper.vm.$confirm = jest.fn();

        await wrapper.vm.cancel();

        expect(wrapper.vm.$confirm).toHaveBeenCalledTimes(1);
      });
    });
  });
});
