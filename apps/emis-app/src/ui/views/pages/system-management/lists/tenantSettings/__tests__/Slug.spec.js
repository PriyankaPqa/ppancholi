import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';

import Component from '../Slug.vue';

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

describe('Slug.vue', () => {
  describe('Template', () => {
    describe('visibility of view slug', () => {
      it('is visible if not edit mode', async () => {
        await wrapper.setData({
          isEditing: false,
        });

        expect(wrapper.findDataTest('view-slug').exists()).toBeTruthy();
      });

      it('is not visible in edit mode', async () => {
        await wrapper.setData({
          isEditing: true,
        });

        expect(wrapper.findDataTest('view-slug').exists()).toBeFalsy();
      });
    });

    describe('visibility of edit slug', () => {
      it('is not visible if not edit mode', async () => {
        await wrapper.setData({
          isEditing: false,
        });

        expect(wrapper.findDataTest('edit-slug').exists()).toBeFalsy();
      });

      it('is visible in edit mode', async () => {
        await wrapper.setData({
          isEditing: true,
        });

        expect(wrapper.findDataTest('edit-slug').exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('slug', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.slug).toBe(tenantSettingsStore.currentTenantSettings.slug);
      });
    });

    describe('rules', () => {
      it('returns correct value', async () => {
        await wrapper.setData({
          tempSlug: 'slug',
        });

        expect(wrapper.vm.rules).toEqual({
          required: true,
          customValidator: {
            isValid: true,
            messageKey: 'system_management.userAccounts.tenantSettings.slug.errorMsg',
          },
        });

        await wrapper.setData({
          tempSlug: 'Slug',
        });

        expect(wrapper.vm.rules).toEqual({
          required: true,
          customValidator: {
            isValid: false,
            messageKey: 'system_management.userAccounts.tenantSettings.slug.errorMsg',
          },
        });
      });
    });

    describe('isDirty', () => {
      it('returns false if tempSlug is the same from storage', async () => {
        const testSlug = 'slug';

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            slug() {
              return testSlug;
            },
          },

        });

        await wrapper.setData({
          tempSlug: testSlug,
          isEditing: true,
        });

        expect(wrapper.vm.isDirty).toBe(false);
      });

      it('returns false if isEditing is false', async () => {
        const testSlug = 'slug-1';

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            slug() {
              return testSlug;
            },
          },

        });

        await wrapper.setData({
          tempSlug: 'slug-2',
          isEditing: false,
        });

        expect(wrapper.vm.isDirty).toBe(false);
      });

      it('returns true if no tempLogoUrl is different than storage', async () => {
        const testSlug = 'slug-1';

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            slug() {
              return testSlug;
            },
          },

        });

        await wrapper.setData({
          tempSlug: 'slug-2',
          isEditing: true,
        });

        expect(wrapper.vm.isDirty).toBe(true);
      });
    });
  });

  describe('>> Methods', () => {
    describe('enterEditMode', () => {
      it('sets data properly', () => {
        const testSlug = 'slug';

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            slug() {
              return testSlug;
            },
          },

        });

        wrapper.vm.enterEditMode();

        expect(wrapper.vm.isEditing).toBe(true);
        expect(wrapper.vm.tempSlug).toBe(testSlug);
      });

      it('emits event', () => {
        wrapper.vm.enterEditMode();
        expect(wrapper.emitted('update:is-editing')[0][0]).toEqual(true);
      });
    });

    describe('exitEditMode', () => {
      it('sets data properly', () => {
        const testSlug = 'slug';

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            slug() {
              return testSlug;
            },
          },

        });

        wrapper.vm.exitEditMode();

        expect(wrapper.vm.isEditing).toBe(false);
        expect(wrapper.vm.tempSlug).toBe(testSlug);
      });

      it('emits event', () => {
        wrapper.vm.exitEditMode();
        expect(wrapper.emitted('update:is-editing')[0][0]).toEqual(false);
      });
    });

    describe('submit', () => {
      it('calls the store to create tenant settings', async () => {
        await wrapper.setData({
          tempSlug: 'slug',
        });

        await wrapper.vm.submit();

        expect(tenantSettingsStore.createTenantSettings).toHaveBeenCalledWith({
          slug: 'slug',
        });
      });
    });

    describe('cancel', () => {
      it('pop confirmation dialog', async () => {
        wrapper = shallowMount(Component, {
          localVue,
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
