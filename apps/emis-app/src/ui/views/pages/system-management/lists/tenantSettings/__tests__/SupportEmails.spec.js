import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import entityUtils from '@libs/core-lib/entities/utils';
import Component from '../SupportEmails.vue';

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

describe('SupportEmails.vue', () => {
  describe('Template', () => {
    describe('visibility of view supportEmails', () => {
      it('is visible if not edit mode', async () => {
        await wrapper.setData({
          isEditing: false,
        });

        expect(wrapper.findDataTest('view-supportEmails').exists()).toBeTruthy();
      });

      it('is not visible in edit mode', async () => {
        await wrapper.setData({
          isEditing: true,
        });

        expect(wrapper.findDataTest('view-supportEmails').exists()).toBeFalsy();
      });
    });

    describe('visibility of edit supportEmails', () => {
      it('is not visible if not edit mode', async () => {
        await wrapper.setData({
          isEditing: false,
        });

        expect(wrapper.findDataTest('edit-supportEmails').exists()).toBeFalsy();
      });

      it('is visible in edit mode', async () => {
        await wrapper.setData({
          isEditing: true,
        });

        expect(wrapper.findDataTest('edit-supportEmails').exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('emails', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.emails).toEqual(storage.tenantSettings.getters.currentTenantSettings()?.supportEmails);
      });
    });

    describe('isDirty', () => {
      it('returns false if tempEmails is the same from storage', async () => {
        const mockEmails = { translation: { en: 'mock@email.com' } };

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          data() {
            return {
              tempEmails: mockEmails,
            };
          },
          computed: {
            emails() {
              return mockEmails;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.isDirty).toBe(false);
      });

      it('returns true if tempEmails is different than storage emails', async () => {
        const mockEmails = { translation: { en: 'mock@email.com' } };

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            emails() {
              return mockEmails;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.setData({
          tempEmails: { translation: { en: 'mock_2@email.com' } },
        });

        expect(wrapper.vm.isDirty).toBe(true);
      });
    });
  });

  describe('>> Methods', () => {
    describe('enterEditMode', () => {
      it('sets data properly', () => {
        const mockEmails = { translation: { en: 'mock@email.com' } };

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            emails() {
              return mockEmails;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.enterEditMode();

        expect(wrapper.vm.isEditing).toBe(true);
        expect(wrapper.vm.tempEmails).toEqual(mockEmails);
      });

      it('emits event', () => {
        wrapper.vm.enterEditMode();
        expect(wrapper.emitted('update:is-editing')[0][0]).toEqual(true);
      });
    });

    describe('exitEditMode', () => {
      it('sets data properly', () => {
        const mockEmails = { translation: { en: 'mock@email.com' } };

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          computed: {
            emails() {
              return mockEmails;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.exitEditMode();

        expect(wrapper.vm.isEditing).toBe(false);
        expect(wrapper.vm.tempEmails).toBeNull();
      });

      it('emits event', () => {
        wrapper.vm.exitEditMode();
        expect(wrapper.emitted('update:is-editing')[0][0]).toEqual(false);
      });
    });

    describe('setLanguageMode', () => {
      it('sets languageMode', async () => {
        await wrapper.setData({
          tempEmails: { translation: { en: 'mock@email.com' } },
        });

        wrapper.vm.setLanguageMode('fr');

        expect(wrapper.vm.languageMode).toBe('fr');
      });

      it('fills empty multilingual fields', async () => {
        await wrapper.setData({
          tempEmails: { translation: { en: 'mock@email.com' } },
        });

        jest.spyOn(entityUtils, 'getFilledMultilingualField');

        wrapper.vm.setLanguageMode('fr');

        expect(entityUtils.getFilledMultilingualField).toHaveBeenCalledTimes(1);
      });
    });

    describe('submit', () => {
      it('calls storage to create tenant settings', async () => {
        await wrapper.setData({
          tempEmails: { translation: { en: 'mock_en@email.com', fr: 'mock_fr@email.com' } },
        });

        await wrapper.vm.submit();

        expect(wrapper.vm.$storage.tenantSettings.actions.updateSupportEmails).toHaveBeenCalledWith({
          translation: { en: 'mock_en@email.com', fr: 'mock_fr@email.com' },
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
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.$confirm = jest.fn();

        await wrapper.vm.cancel();

        expect(wrapper.vm.$confirm).toHaveBeenCalledTimes(1);
      });
    });

    describe('clearEmails', () => {
      it('calls initMultilingualAttributes and sets the result into tempEmails', async () => {
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
          mocks: {
            $storage: storage,
          },
        });

        entityUtils.initMultilingualAttributes = jest.fn(() => ({ translation: { en: 'test' } }));
        await wrapper.vm.clearEmails();

        expect(entityUtils.initMultilingualAttributes).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.tempEmails).toEqual({ translation: { en: 'test' } });
      });
    });
  });
});
