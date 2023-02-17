import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { LOGO_EXTENSIONS } from '@/constants/documentExtensions';
import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';

import Component from '../Logo.vue';

const localVue = createLocalVue();

let wrapper;

const doMount = (shallow = true) => {
  const opts = {
    localVue,
    propsData: {
      disableEditBtn: false,
    },
  };
  if (shallow) {
    wrapper = shallowMount(Component, opts);
  } else {
    wrapper = mount(Component, opts);
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  doMount();
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

        });

        expect(wrapper.vm.dimensionsRuleText).toEqual(`system_management.branding.logo.maxDimensions: ${maxWidth}px × ${maxHeight}px`);
      });
    });

    describe('typesRuleText', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.typesRuleText).toEqual(`system_management.branding.logo.typesAllowed: .${LOGO_EXTENSIONS.join(', .')}`);
      });
    });

    describe('isDirty', () => {
      it('returns false if no tempLogoUrl', async () => {
        await wrapper.setData({
          tempLogoUrl: null,
        });

        expect(wrapper.vm.isDirty).toBe(false);
      });

      it('returns false if tempLogoUrl is the same from storage', async () => {
        const testUrl = 'url';

        wrapper.vm.getLogoUrl = jest.fn(() => testUrl);

        await wrapper.setData({
          tempLogoUrl: testUrl,
        });

        expect(wrapper.vm.isDirty).toBe(false);
      });

      it('returns true if tempLogoUrl is different than storage', async () => {
        wrapper.vm.getLogoUrl = jest.fn(() => 'url 1');
        await wrapper.setData({
          tempLogoUrl: 'url 2',
        });

        expect(wrapper.vm.isDirty).toBe(true);
      });
    });
  });

  describe('>> Methods', () => {
    describe('enterEditMode', () => {
      it('sets data properly', () => {
        wrapper.vm.getLogoUrl = jest.fn(() => 'url');

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

    describe('getLogoUrl', () => {
      it('returns correct value', () => {
        wrapper.vm.$services.tenantSettings.getLogoUrl = jest.fn(() => 'url');

        expect(wrapper.vm.getLogoUrl('en').startsWith('url')).toBeTruthy();
      });
    });

    describe('upload', () => {
      it('calls uploadForm', async () => {
        wrapper.vm.uploadForm = jest.fn();

        await wrapper.vm.upload();

        expect(wrapper.vm.uploadForm).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Template', () => {
    describe('RcFileUpload', () => {
      it('should sanitize file name before upload', async () => {
        doMount(false);
        await wrapper.setData({
          isEditing: true,
        });
        expect(wrapper.findComponent(RcFileUpload).props('sanitizeFileName')).toEqual(true);
      });
    });
  });
});
