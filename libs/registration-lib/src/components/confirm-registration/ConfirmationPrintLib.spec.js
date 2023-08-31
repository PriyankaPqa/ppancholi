import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './ConfirmationPrintLib.vue';

const localVue = createLocalVue();

describe('ConfirmationPrintLib.vue', () => {
  let wrapper;

  const event = {
    name: {
      translation: {
        en: 'event name',
      },
    },
    responseDetails: {
      assistanceNumber: '+1-504-555-5555',
    },
  };

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          event,
          registrationNumber: '12345',
        },
      });
    });

    describe('confirmationID', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('confirmation-id');
        expect(component.text()).toBe('12345');
      });
    });

    describe('eventName', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('event-name');
        expect(component.text()).toBe('event name');
      });
    });

    describe('phoneAssistance', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('phone-assistance');
        expect(component.text()).toContain('registration.confirmation.additional_assistance');
        expect(component.text()).toContain('1 (504) 555-5555');
      });
    });
  });
});
