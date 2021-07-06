import { mockStorage } from '@/store/storage/storage.mock';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockHouseholdEntity } from '@/entities/household';
import { mockEvent } from '@/entities/event';
import { mockHttpError } from '@/services/httpClient.mock';
import Component from './ConfirmRegistration.vue';

const localVue = createLocalVue();

const storage = mockStorage();

const computed = {
  response: () => mockHouseholdEntity(),
  event: () => ({
    name: {
      translation: {
        en: 'event name',
      },
    },
  }),
  confirmationMessage: () => 'confirm message',
  phoneAssistance: () => 'phone',
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
      it('returns true if no errors', async () => {
        expect(wrapper.vm.success).toEqual(true);
      });

      it('returns false if errors', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            errors: () => [mockHttpError()],
            phoneAssistance: () => 'phone',
          },
        });
        expect(wrapper.vm.success).toEqual(false);
      });
    });

    describe('response', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.response).toEqual(mockHouseholdEntity());
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

    describe('errors', () => {
      it('returns errors from the store', async () => {
        expect(wrapper.vm.errors).toEqual(wrapper.vm.$storage.registration.getters.registrationErrors());
      });
    });
  });
});
