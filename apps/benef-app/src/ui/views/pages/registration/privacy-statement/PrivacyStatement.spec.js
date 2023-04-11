import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { createTestingPinia } from '@pinia/testing';
import { mockEvent } from '@libs/entities-lib/registration-event';
import { mockProvider } from '@/services/provider';
import Component from './PrivacyStatement.vue';

const services = mockProvider();

const pinia = createTestingPinia({ stubActions: false });

describe('PrivacyStatement.vue', () => {
  const localVue = createLocalVue();
  let wrapper;

  const mountWrapper = (fullMount = false, otherOptions = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        event: mockEvent,
        id: '1',
      },
      mocks: { $t: (k) => k, $services: services },
      ...otherOptions,
    });
  };

  describe('Lifecycle', () => {
    beforeEach(() => {
      mountWrapper();
    });
    describe('created', () => {
      it('should get consent statement', async () => {
        expect(wrapper.vm.consentStatement).toEqual(await wrapper.vm.getConsentStatement());
      });
    });
  });

  describe('>> Methods', () => {
    beforeEach(() => {
      const event = mockEvent();
      event.id = 'id-1';
      mountWrapper(
        false,
        { propsData: {
          event,
          id: '1',
        } },
      );
    });
    describe('getConsentStatement', () => {
      it('returns correct value', async () => {
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.consentStatement).toEqual(wrapper.vm.$services.tenantSettings.getConsentStatement('id-1'));
      });

      it('calls the getConsentStatement service', async () => {
        await wrapper.vm.getConsentStatement();
        expect(wrapper.vm.$services.tenantSettings.getConsentStatement).toHaveBeenCalled();
      });
    });
  });
});
