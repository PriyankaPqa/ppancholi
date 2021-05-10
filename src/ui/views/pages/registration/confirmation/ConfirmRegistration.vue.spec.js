import { mockStorage } from '@/store/storage/storage.mock';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCreateBeneficiaryResponse } from '@crctech/registration-lib/src/entities/beneficiary';
import { mockEvent } from '@crctech/registration-lib/src/entities/event';
import Component from './ConfirmRegistration.vue';

const localVue = createLocalVue();

const storage = mockStorage();

const computed = {
  success: () => true,
  response: () => mockCreateBeneficiaryResponse(),
  event: () => ({
    name: {
      translation: {
        en: 'event name',
      },
    },
  }),
  confirmationMessage: () => 'confirm message',
};

describe('ConfirmRegistration.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed,
      });
    });

    describe('confirmationMessage', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('confirm-registration-message');
        expect(component.text()).toBe(computed.confirmationMessage());
      });
    });

    describe('registrationNumber', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('confirm-registration-number');
        expect(component.text()).toBe(computed.response().registrationNumber);
      });
    });

    describe('event name', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('confirm-registration-event-name');
        expect(component.text()).toBe(computed.event().name.translation.en);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('success', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.success).toEqual(true);
      });
    });

    describe('response', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.response).toEqual(mockCreateBeneficiaryResponse());
      });
    });

    describe('event', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.event).toEqual(mockEvent());
      });
    });

    describe('confirmationMessage', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.confirmationMessage).toEqual('registration.confirmation.thank_you');
      });
    });

    describe('phoneAssistance', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.phoneAssistance).toEqual(mockEvent().responseDetails.assistanceNumber);
      });
    });
  });
});
