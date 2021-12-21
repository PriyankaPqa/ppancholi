/**
 * @group ui/components/shared-components
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import Component from './LanguageSelector.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Language Selector', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('locales', () => {
      it('should return tenant languages if defined', () => {
        const expected = [{ disabled: true, label: 'English', value: 'en' }, { disabled: false, label: 'Français', value: 'fr' }];
        expect(wrapper.vm.locales).toEqual(expected);
      });

      it('should return Trans.supportedLanguages otherwise', () => {
        wrapper.vm.$storage.tenantSettings.getters.currentTenantSettings = jest.fn(() => {});
        const expected = [
          { disabled: true, label: 'English', value: 'en' },
          { disabled: false, label: 'Français', value: 'fr' },
          { disabled: false, label: 'Test', value: 'test' },
        ];
        expect(wrapper.vm.locales).toEqual(expected);
      });
    });
  });
});
