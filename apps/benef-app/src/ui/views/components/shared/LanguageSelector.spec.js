import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import { createTestingPinia } from '@pinia/testing';
import { mockProvider } from '@/services/provider';
import { Trans } from '@/ui/plugins/translation';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import Component from './LanguageSelector.vue';

const localVue = createLocalVue();
const services = mockProvider();
const pinia = createTestingPinia({ stubActions: false });

describe('LanguageSelector.vue', () => {
  let wrapper;

  const doMount = async (fullmount = false, otherComputed = {}, featureList = []) => {
    wrapper = (fullmount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      featureList,
      mocks: {
        $services: services,
      },
      stubs: ['i18n'],
      computed: {
        ...otherComputed,
      },
    });
    await wrapper.vm.$nextTick();
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await doMount();
    });

    describe('setLanguage', () => {
      it('should emit lang value to event setLanguage', async () => {
        Trans.changeLanguage = jest.fn(() => Promise.resolve({}));
        EventHub.$emit = jest.fn();

        wrapper.vm.setLanguage('en');

        expect(EventHub.$emit).toHaveBeenCalledWith('setLanguage', 'en');
      });
    });
  });
});
