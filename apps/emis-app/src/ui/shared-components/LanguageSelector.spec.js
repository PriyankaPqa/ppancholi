import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import Component from './LanguageSelector.vue';

const localVue = createLocalVue();

const { pinia } = useMockTenantSettingsStore();

describe('Language Selector', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
    });
  });

  describe('Computed', () => {
    describe('locales', () => {
      it('should return tenant languages if defined', () => {
        const expected = [{ disabled: true, label: 'English', value: 'en' }, { disabled: false, label: 'Français', value: 'fr' }];
        expect(wrapper.vm.locales).toEqual(expected);
      });

      it('should return Trans.supportedLanguages otherwise', () => {
        const expected = [
          { disabled: true, label: 'English', value: 'en' },
          { disabled: false, label: 'Français', value: 'fr' },
        ];
        expect(wrapper.vm.locales).toEqual(expected);
      });
    });
  });
});
