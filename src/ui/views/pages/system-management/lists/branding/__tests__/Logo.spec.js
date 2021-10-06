import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import Component from '../Logo.vue';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { LOGO_EXTENSIONS } from '@/constants/documentExtensions';

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

describe('Logo.vue', () => {
  describe('Computed', () => {
    describe('supportedLanguages', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.supportedLanguages).toBe(SUPPORTED_LANGUAGES_INFO);
      });
    });

    describe('dimensionsRuleText', () => {
      it('returns correct value', () => {
        const maxWidth = 480;
        const maxHeight = 192;

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableEditBtn: false,
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.dimensionsRuleText).toEqual(`system_management.branding.logo.maxDimensions: ${maxWidth}px × ${maxHeight}px`);
      });
    });

    describe('typesRuleText', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.typesRuleText).toEqual(`system_management.branding.logo.typesAllowed: .${LOGO_EXTENSIONS.join(', .')}`);
      });
    });
  });

  describe('>> Methods', () => {
    describe('enterEditMode', () => {
      it('sets data properly', () => {
        wrapper.vm.getLogoUrlFromStore = jest.fn(() => 'url');

        wrapper.vm.enterEditMode('en');

        expect(wrapper.vm.isEditing).toBe(true);
        expect(wrapper.vm.currentLogoLanguage).toBe('en');
        expect(wrapper.vm.tempLogoUrl).toBe('url');
      });
    });

    describe('exitEditMode', () => {
      it('sets data properly', () => {
        wrapper.vm.exitEditMode();

        expect(wrapper.vm.isEditing).toBe(false);
        expect(wrapper.vm.errors).toEqual([]);
      });
    });

    describe('updateFile', () => {
      it('sets data properly', () => {
        wrapper.vm.exitEditMode();

        expect(wrapper.vm.isEditing).toBe(false);
        expect(wrapper.vm.errors).toEqual([]);
      });
    });

    describe('getLogoUrlFromStore', () => {
      it('returns correct value', () => {
        wrapper.vm.$storage.branding.getters.logoUrl = jest.fn(() => 'url');

        expect(wrapper.vm.getLogoUrlFromStore('en')).toEqual('url');
      });
    });

    describe('upload', () => {
      it('calls uploadForm', async () => {
        wrapper.vm.uploadForm = jest.fn();

        await wrapper.vm.upload();

        expect(wrapper.vm.uploadForm).toHaveBeenCalledTimes(1);
      });

      it('fetches logo if upload success', async () => {
        wrapper.vm.uploadForm = jest.fn(() => {
          wrapper.vm.uploadSuccess = true;
        });

        await wrapper.vm.upload();

        expect(wrapper.vm.$storage.branding.actions.getLogoUrl).toHaveBeenCalledTimes(1);
      });
    });
  });
});
