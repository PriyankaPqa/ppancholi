import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockDetailedRegistrationResponse } from '@libs/entities-lib/src/household';
import { mockEventSummary } from '@libs/entities-lib/event';
import { mockServerError } from '@libs/services-lib/src/http-client';
import Component from './ConfirmRegistrationLib.vue';

const localVue = createLocalVue();

// eslint-disable-next-line no-console
console.warn = jest.fn();

const computed = {
  response: () => mockDetailedRegistrationResponse(),
  event: () => ({
    name: {
      translation: {
        en: 'event name',
      },
    },
  }),
  confirmationMessagePath: () => 'confirm message',
  phoneAssistance: () => 'phone',
  initialTitle: () => 'mock-title',
  initialButtonText: () => 'mock-text',
};

describe('ConfirmRegistrationLib.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed,
      });
    });

    describe('complete-assessment-message', () => {
      it('should render depending on showCompleteAssessmentMessage', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            showCompleteAssessmentMessage: () => false,
          },
        });

        let component = wrapper.findDataTest('complete-assessment-message');
        expect(component.exists()).toBeFalsy();

        wrapper = mount(Component, {
          localVue,
          computed: {
            showCompleteAssessmentMessage: () => true,
          },
        });

        component = wrapper.findDataTest('complete-assessment-message');
        expect(component.text()).toContain('registration.page.assessment');
      });
    });

    describe('identity-authentication-section', () => {
      it('should render depending on identityAuthenticationMessage', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            identityAuthenticationMessage: () => null,
          },
        });

        let component = wrapper.findDataTest('identity-authentication-section');
        expect(component.exists()).toBeFalsy();

        wrapper = mount(Component, {
          localVue,
          computed: {
            identityAuthenticationMessage: () => ({ header: 'identity-authentication-section', details: 'hi' }),
          },
        });

        component = wrapper.findDataTest('identity-authentication-section');
        expect(component.text()).toContain('registration.confirmation.identityAuthentication');
      });
    });

    describe('confirmationMessagePath', () => {
      it('should render it', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            associationMode: () => false,
            isCRCRegistration: () => false,
          },
        });

        const component = wrapper.findDataTest('confirm-registration-message');
        expect(component.text()).toBe('registration.confirmation.thank_you');
      });

      it('should render it - association Mode', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            associationMode: () => true,
            isCRCRegistration: () => false,
          },
        });

        const component = wrapper.findDataTest('confirm-registration-message');
        expect(component.text()).toBe('registration.confirmation.associate');
      });

      it('should render it - crc registration', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            associationMode: () => false,
            isCRCRegistration: () => true,
          },
        });

        const component = wrapper.findDataTest('confirm-registration-message');
        expect(component.text()).toBe('registration.crc_confirmation.thank_you');
      });
    });

    describe('registrationNumber', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('confirm-registration-number');
        expect(component.text()).toBe(computed.response().household.registrationNumber);
      });
    });

    describe('event name', () => {
      it('should render it', () => {
        const component = wrapper.findDataTest('confirm-registration-event-name');
        expect(component.text()).toBe(computed.event().name.translation.en);
      });
    });

    describe('additional_assistance name message path', () => {
      it('should render it', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            ...computed,
            isCRCRegistration: () => true,
          },
        });
        const component = wrapper.findDataTest('confirm-registration-additional_assistance-fullname');
        expect(component.text()).toBe('registration.crc_confirmation.additional_assistance');
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      wrapper.vm.$registrationStore.householdAssociationMode = false;
      wrapper.vm.$registrationStore.registrationResponse = mockDetailedRegistrationResponse();
    });

    describe('associationMode', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.associationMode).toEqual(wrapper.vm.$registrationStore.householdAssociationMode);
      });
    });

    describe('showCompleteAssessmentMessage', () => {
      it('returns the proper data according to assessmentToComplete', async () => {
        wrapper = shallowMount(Component, {
          localVue,
        });
        wrapper.vm.$registrationStore.assessmentToComplete = true;
        expect(wrapper.vm.showCompleteAssessmentMessage).toBeTruthy();

        wrapper = shallowMount(Component, {
          localVue,
        });
        wrapper.vm.$registrationStore.assessmentToComplete = false;
        expect(wrapper.vm.showCompleteAssessmentMessage).toBeFalsy();
      });

      it('shouldn\'t return true when L0 and not enabled for L0', () => {
        wrapper = shallowMount(Component, {
          localVue,
        });
        wrapper.vm.$hasRole = (lvl) => (lvl === 'level0');
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);

        const event = wrapper.vm.$registrationStore.getEvent();
        wrapper.vm.$registrationStore.getEvent = () => event;
        event.assessmentsForL0usersEnabled = false;
        jest.clearAllMocks();
        wrapper.vm.$registrationStore.assessmentToComplete = true;
        expect(wrapper.vm.showCompleteAssessmentMessage).toBeFalsy();

        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
        wrapper = shallowMount(Component, {
          localVue,
        });
        wrapper.vm.$hasRole = (lvl) => (lvl === 'level0');
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        wrapper.vm.$registrationStore.getEvent = () => event;
        event.assessmentsForL0usersEnabled = true;
        expect(wrapper.vm.showCompleteAssessmentMessage).toBeTruthy();

        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
        wrapper = shallowMount(Component, {
          localVue,
        });
        wrapper.vm.$hasRole = (lvl) => (lvl === 'level1');
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        wrapper.vm.$registrationStore.getEvent = () => event;
        event.assessmentsForL0usersEnabled = false;
        expect(wrapper.vm.showCompleteAssessmentMessage).toBeTruthy();
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
      });
    });

    describe('identityAuthenticationMessage', () => {
      it('returns the proper data according to tier2Completed and mustDoTier2authentication', async () => {
        wrapper.vm.$registrationStore.tier2State = { mustDoTier2: false };
        expect(wrapper.vm.identityAuthenticationMessage).toBeFalsy();

        wrapper.vm.$registrationStore.tier2State = { mustDoTier2: true, completed: false };
        expect(wrapper.vm.identityAuthenticationMessage).toEqual({
          header: 'registration.confirmation.identityAuthentication.notVerified',
          details: 'registration.confirmation.identityAuthentication.notVerified.details',
          color: 'red',
          icon: 'mdi-alert',
        });

        wrapper.vm.$registrationStore.tier2State = { mustDoTier2: true, completed: true, status: 1 };
        expect(wrapper.vm.identityAuthenticationMessage).toEqual({
          header: 'registration.confirmation.identityAuthentication.verified',
          icon: 'mdi-check',
        });

        /// temporarily commented out.  until they are sure of gambit's 1 document results
        // wrapper.vm.$registrationStore.tier2State = { mustDoTier2: true, completed: true, status: 0, basicDocumentsOnly: true };
        // expect(wrapper.vm.identityAuthenticationMessage).toEqual({
        //   header: 'registration.confirmation.identityAuthentication.pending1Document',
        //   details: 'registration.confirmation.identityAuthentication.pending1Document.details',
        //   color: 'red',
        //   icon: 'mdi-alert',
        // });

        wrapper.vm.$registrationStore.tier2State = { mustDoTier2: true, completed: true, status: 0, basicDocumentsOnly: false };
        expect(wrapper.vm.identityAuthenticationMessage).toEqual({
          header: 'registration.confirmation.identityAuthentication.pending2Document',
          details: 'registration.confirmation.identityAuthentication.pending2Document.details',
          icon: 'mdi-information',
        });
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
            errors: () => mockServerError(),
            phoneAssistance: () => 'phone',
          },
        });
        expect(wrapper.vm.success).toEqual(false);
      });

      it('returns false if response is undefined', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            errors: () => mockServerError(),
            response: () => undefined,
          },
        });
        expect(wrapper.vm.success).toEqual(false);
      });
    });

    describe('response', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.response).toEqual(mockDetailedRegistrationResponse());
      });
    });

    describe('fullName', () => {
      it('returns the proper data when household mode', async () => {
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
      it('returns the proper data when tier 2 link mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
        });
        wrapper.vm.$registrationStore.basicInformationWhenTier2FromEmail = {
          firstName: 'firstName2',
          middleName: 'middleName',
          lastName: 'lastName',
        };

        expect(wrapper.vm.fullName).toEqual('firstName2 middleName lastName');
      });
    });

    describe('event', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.event).toEqual(mockEventSummary());
      });
    });

    describe('confirmationMessagePath', () => {
      it('returns the proper data', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => false,
            isCRCRegistration: () => false,
          },
        });
        expect(wrapper.vm.confirmationMessagePath).toEqual('registration.confirmation.thank_you');

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => true,
            isCRCRegistration: () => false,
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
            response: () => ({ household: { registrationNumber: 'registrationNumber' } }),
          },
        });

        expect(wrapper.vm.registrationNumber).toEqual('registrationNumber');

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => true,
            household: () => ({ registrationNumber: 'associate registrationNumber' }),
            response: () => ({ household: { registrationNumber: 'registrationNumber' } }),
          },
        });

        expect(wrapper.vm.registrationNumber).toEqual('associate registrationNumber');
      });
      it('returns the proper data when tier 2 link mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
        });
        wrapper.vm.$registrationStore.basicInformationWhenTier2FromEmail = {
          registrationNumber: 'registrationNumber2',
        };

        expect(wrapper.vm.registrationNumber).toEqual('registrationNumber2');
      });
    });

    describe('phoneAssistance', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.phoneAssistance).toEqual(mockEventSummary().responseDetails.assistanceNumber);
      });
    });

    describe('errors', () => {
      it('returns errors from the store', async () => {
        expect(wrapper.vm.errors).toEqual(wrapper.vm.$registrationStore.registrationErrors);
      });
    });

    describe('initialTitle', () => {
      it('returns the proper data', () => {
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({ titleKey: 'mock title', nextButtonTextKey: 'mock text' }));
        expect(wrapper.vm.initialTitle).toEqual('mock title');
      });
    });

    describe('initialButtonText', () => {
      it('returns the proper data', () => {
        expect(wrapper.vm.initialButtonText).toEqual('mock text');
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed,
      });
    });

    describe('clearTabErrorFunc', () => {
      it('clears error in current tab', () => {
        const tab = {
          nextButtonTextKey: 'button label',
          titleKey: 'title',
          isValid: false,
        };

        wrapper.vm.clearTabErrorFunc(tab);

        expect(tab).toEqual({
          nextButtonTextKey: 'mock-text',
          titleKey: 'mock-title',
          isValid: true,
        });
      });
    });
  });
});
