import { mockStorage } from '@/store/storage/storage.mock';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
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
  confirmationMessagePath: () => 'confirm message',
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

    describe('confirmationMessagePath', () => {
      it('should render it', () => {
        wrapper = mount(Component, {
          localVue,
          computed,
        });

        const component = wrapper.findDataTest('confirm-registration-message');
        expect(component.text()).toBe(computed.confirmationMessagePath());
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
        store: {
          modules: {
            registration: {
              state: {
                householdAssociationMode: false,
              },
            },
          },
        },
      });
    });

    describe('associationMode', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.associationMode).toEqual(wrapper.vm.$store.state.registration.householdAssociationMode);
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

    describe('fullName', () => {
      it('returns the proper data', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            household: () => ({
              primaryBeneficiary: {
                identitySet: {
                  firstName: 'firstName',
                  middleName: 'middleName',
                  lastName: 'lastName',
                },
              },
            }),
          },
        });

        expect(wrapper.vm.fullName).toEqual('firstName middleName lastName');
      });
    });

    describe('event', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.event).toEqual(mockEvent());
      });
    });

    describe('confirmationMessagePath', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.confirmationMessagePath).toEqual('registration.confirmation.thank_you');

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => true,
          },
        });

        expect(wrapper.vm.confirmationMessagePath).toEqual('registration.confirmation.associate');
      });
    });

    describe('registrationNumber', () => {
      it('returns the proper data', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => false,
            household: () => ({ registrationNumber: 'associate registrationNumber' }),
            response: () => ({ registrationNumber: 'registrationNumber' }),
          },
        });

        expect(wrapper.vm.registrationNumber).toEqual('registrationNumber');

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => true,
            household: () => ({ registrationNumber: 'associate registrationNumber' }),
            response: () => ({ registrationNumber: 'registrationNumber' }),
          },
        });

        expect(wrapper.vm.registrationNumber).toEqual('associate registrationNumber');
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
