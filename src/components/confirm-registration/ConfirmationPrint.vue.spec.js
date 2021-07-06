import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './ConfirmationPrint.vue';

const localVue = createLocalVue();

describe('ConfirmationPrint.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $route: {
            query: {
              confirmationID: 'confirmationID',
              eventName: 'eventName',
              phoneAssistance: 'phoneAssistance',
            },
          },
        },
      });
    });

    describe('confirmationID', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('confirmation-id');
        expect(component.text()).toBe('confirmationID');
      });
    });

    describe('eventName', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('event-name');
        expect(component.text()).toBe('eventName');
      });
    });

    describe('phoneAssistance', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('phone-assistance');
        expect(component.text()).toContain('registration.confirmation.additional_assistance');
      });
    });
  });
});
