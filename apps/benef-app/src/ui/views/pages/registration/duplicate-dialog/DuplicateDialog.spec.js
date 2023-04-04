import { createLocalVue, shallowMount } from '@/test/testSetup';

import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { createTestingPinia } from '@pinia/testing';
import { mockProvider } from '@/services/provider';
import Component from './DuplicateDialog.vue';

const localVue = createLocalVue();
const services = mockProvider();
const pinia = createTestingPinia({ stubActions: false });
const registrationStore = useMockRegistrationStore(pinia).registrationStore;
const duplicateResults = {
  duplicateFound: true,
  duplicateHouseholdId: 'duplicateHouseholdId',
  registeredToEvent: false,
  maskedEmail: 'maskedEmail',
  maskedMobilePhone: 'maskedMobilePhone',
  maskedHomePhone: 'maskedHomePhone',
  maskedAlternatePhoneNumber: 'maskedAlternatePhoneNumber',
};

describe('DuplicateDialog.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        show: true,
        duplicateResults,
        phone: '555-555-4444',
      },
      mocks: {
        $services: services,
      },
    });
  });

  describe('Computed', () => {
    describe('title', () => {
      it('depends on whether the person is already registered for the event', async () => {
        expect(wrapper.vm.title).toEqual('duplicate.confirmBeneficiary.title');

        await wrapper.setProps({ duplicateResults: { ...duplicateResults, registeredToEvent: true } });
        expect(wrapper.vm.title).toEqual('duplicate.alreadyRegistered.title');
      });
    });

    describe('salutations', () => {
      it('shows text depending on name', () => {
        expect(wrapper.vm.salutations).toEqual({ key: 'duplicate.salutations', params: [{ name: 'Bob Smith' }] });
      });
    });

    describe('communicationMethods', () => {
      it('returns value depending on available methods', async () => {
        expect(wrapper.vm.communicationMethods).toEqual([
          { maskedInfo: 'maskedEmail', text: 'duplicate.CommunicationMethod.Email', type: 1 },
          { maskedInfo: 'maskedHomePhone', text: 'duplicate.CommunicationMethod.HomePhone', type: 2 },
          { maskedInfo: 'maskedMobilePhone', text: 'duplicate.CommunicationMethod.MobilePhone', type: 3 },
          { maskedInfo: 'maskedAlternatePhoneNumber', text: 'duplicate.CommunicationMethod.AlternatePhone', type: 4 },
        ]);
        await wrapper.setProps({ duplicateResults: { ...duplicateResults, maskedAlternatePhoneNumber: null } });
        expect(wrapper.vm.communicationMethods).toEqual([
          { maskedInfo: 'maskedEmail', text: 'duplicate.CommunicationMethod.Email', type: 1 },
          { maskedInfo: 'maskedHomePhone', text: 'duplicate.CommunicationMethod.HomePhone', type: 2 },
          { maskedInfo: 'maskedMobilePhone', text: 'duplicate.CommunicationMethod.MobilePhone', type: 3 },
        ]);
      });
    });

    describe('codeFilled', () => {
      it('returns whether all 6 chars are full', async () => {
        await wrapper.setData({ chars: ['1', '2', '3', '4', '5', ''] });
        expect(wrapper.vm.codeFilled).toBeFalsy();
        await wrapper.setData({ chars: ['1', '2', '3', '4', '5', '6'] });
        expect(wrapper.vm.codeFilled).toBeTruthy();
      });
    });
  });

  describe('Methods', () => {
    describe('close', () => {
      it('emits update:show false', () => {
        wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('next', () => {
      it('emits update:show false and verified-benficiary', async () => {
        wrapper.vm.next();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
        expect(wrapper.emitted('verified-individual')[0][0]).toEqual('duplicateHouseholdId');
      });
    });

    describe('goHome', () => {
      it('calls reset and goes home', () => {
        registrationStore.resetHouseholdCreate = jest.fn();
        registrationStore.resetTabs = jest.fn();
        wrapper.vm.goHome();
        expect(registrationStore.resetHouseholdCreate).toHaveBeenCalled();
        expect(registrationStore.resetTabs).toHaveBeenCalled();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'landingPage.name' });
      });
    });

    describe('resetScreen', () => {
      it('resets data', async () => {
        await wrapper.setData({ selectedCommunication: 1, sentCode: true, codeIsValid: true });
        wrapper.vm.resetScreen();
        expect(wrapper.vm.selectedCommunication).toBeNull();
        expect(wrapper.vm.sentCode).toBeFalsy();
        expect(wrapper.vm.codeIsValid).toBeNull();
      });
    });

    describe('verifyCode', () => {
      it('calls verifyOneTimeCodeRegistrationPublic', async () => {
        window.confirm = () => true;
        await wrapper.setData({ chars: ['1', '2', '3', '4', '5', '6'], selectedCommunication: 1 });
        await wrapper.vm.verifyCode();
        expect(wrapper.vm.$services.households.verifyOneTimeCodeRegistrationPublic).toHaveBeenCalledWith(
          {
            communicationMethod: 1,
            duplicateHouseholdId: 'duplicateHouseholdId',
            code: '123456',
          },
        );
        expect(wrapper.vm.codeIsValid).toBe(await wrapper.vm.$services.households.verifyOneTimeCodeRegistrationPublic());
      });
    });
  });
});
