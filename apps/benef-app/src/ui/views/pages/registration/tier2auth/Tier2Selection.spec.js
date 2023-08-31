import { createLocalVue, shallowMount } from '@/test/testSetup';

import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { createTestingPinia } from '@pinia/testing';
import { mockProvider } from '@/services/provider';
import helpers from '@libs/entities-lib/helpers';
import { Tier2GambitScreeningId } from '@libs/shared-lib/types';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { mockDetailedRegistrationResponse } from '@libs/entities-lib/household';
import Component from './Tier2Selection.vue';

const localVue = createLocalVue();
const services = mockProvider();
const pinia = createTestingPinia({ stubActions: false });
const registrationStore = useMockRegistrationStore(pinia).registrationStore;

registrationStore.registrationResponse = { ...mockDetailedRegistrationResponse(), tier1transactionId: 'tier1transactionId' };

describe('Tier2Selection.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    // i18n is giving warnings during tests
    // eslint-disable-next-line no-console
    console.warn = jest.fn();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      mocks: {
        $services: services,
      },
    });
  });

  describe('Computed', () => {
    describe('registrationResponse', () => {
      it('returns from store', async () => {
        const response = wrapper.vm.registrationResponse;
        expect(response).toEqual(registrationStore.registrationResponse);
      });
    });

    describe('tier2Ids', () => {
      it('returns translated collection', () => {
        expect(wrapper.vm.tier2Ids).toEqual(helpers.enumToTranslatedCollection(Tier2GambitScreeningId, 'enums.Tier2GambitScreeningId', wrapper.vm.$i18n));
      });
    });

    describe('validIdOptions', () => {
      it('returns 2 options + NoBasicId', async () => {
        const result = wrapper.vm.validIdOptions;
        expect(result).toEqual([{
          dataTest: 'CanadianDriverLicense',
          text: 'enums.Tier2GambitScreeningId.CanadianDriverLicense',
          value: 82,
        },
        {
          dataTest: 'ProvincialPhotoId',
          text: 'enums.Tier2GambitScreeningId.ProvincialPhotoId',
          value: 53,
        }, {
          text: 'registration.tier2.NoBasicId',
          value: 0,
        }]);
      });
    });

    describe('otherIdTypeList', () => {
      it('returns multiple options', async () => {
        const result = wrapper.vm.otherIdTypeList;
        expect(result).toEqual([
          {
            dataTest: 'Passport',
            text: 'enums.Tier2GambitScreeningId.Passport',
            value: 2,
          },
          {
            dataTest: 'CanadianCitizenshipCard',
            text: 'enums.Tier2GambitScreeningId.CanadianCitizenshipCard',
            value: 6,
          },
          {
            dataTest: 'CanadianPermanentResidentCard',
            text: 'enums.Tier2GambitScreeningId.CanadianPermanentResidentCard',
            value: 7,
          },
          {
            dataTest: 'IndianStatusCard',
            text: 'enums.Tier2GambitScreeningId.IndianStatusCard',
            value: 29,
          },
          {
            dataTest: 'CanadianFirearmsLicense',
            text: 'enums.Tier2GambitScreeningId.CanadianFirearmsLicense',
            value: 10,
          },
          {
            dataTest: 'NexusCard',
            text: 'enums.Tier2GambitScreeningId.NexusCard',
            value: 28,
          },
          {
            dataTest: 'OntarioHealthCard',
            text: 'enums.Tier2GambitScreeningId.OntarioHealthCard',
            value: 51,
          },
          {
            dataTest: 'QuebecHealthCard',
            text: 'enums.Tier2GambitScreeningId.QuebecHealthCard',
            value: 84,
          },
        ]);
      });
    });

    describe('proofAddressList', () => {
      it('returns multiple options', async () => {
        const result = wrapper.vm.proofAddressList;
        expect(result).toEqual([
          {
            dataTest: 'UtilityBill',
            text: 'enums.Tier2GambitScreeningId.UtilityBill',
            value: 74,
          },
          {
            dataTest: 'MortgageStatement',
            text: 'enums.Tier2GambitScreeningId.MortgageStatement',
            value: 76,
          },
          {
            dataTest: 'PropertyTaxAssessment',
            text: 'enums.Tier2GambitScreeningId.PropertyTaxAssessment',
            value: 77,
          },
          {
            dataTest: 'ProvincialGovernmentMail',
            text: 'enums.Tier2GambitScreeningId.ProvincialGovernmentMail',
            value: 78,
          },
          {
            dataTest: 'FederalGovernmentMail',
            text: 'enums.Tier2GambitScreeningId.FederalGovernmentMail',
            value: 79,
          },
          {
            dataTest: 'BankStatement',
            text: 'enums.Tier2GambitScreeningId.BankStatement',
            value: 80,
          },
          {
            dataTest: 'InsuranceStatement',
            text: 'enums.Tier2GambitScreeningId.InsuranceStatement',
            value: 81,
          },
        ]);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('Event handlers', () => {
      it('connects and disconnects to event hub on created/destroyed', async () => {
        EventHub.$on = jest.fn();
        EventHub.$off = jest.fn();
        jest.clearAllMocks();
        wrapper.vm.$options.created[0].call(wrapper.vm);
        expect(EventHub.$on).toHaveBeenCalledWith('tier2ProcessStart', wrapper.vm.tier2ProcessStart);
        expect(EventHub.$on).toHaveBeenCalledWith('tier2ProcessReset', wrapper.vm.tier2ProcessReset);

        jest.clearAllMocks();
        wrapper.vm.$options.destroyed[1].call(wrapper.vm);
        expect(EventHub.$off).toHaveBeenCalledWith('tier2ProcessStart', wrapper.vm.tier2ProcessStart);
        expect(EventHub.$off).toHaveBeenCalledWith('tier2ProcessReset', wrapper.vm.tier2ProcessReset);
      });

      it('destroy calls tier2ProcessReset', async () => {
        wrapper.vm.tier2ProcessReset = jest.fn();
        jest.clearAllMocks();
        wrapper.vm.$options.destroyed[1].call(wrapper.vm);
        expect(wrapper.vm.tier2ProcessReset).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('attachListener', () => {
      it('sets up process for talking with iframe', async () => {
        window.addEventListener = jest.fn();
        window.removeEventListener = jest.fn();
        wrapper.vm.$refs.iframeObj = { contentWindow: { postMessage: jest.fn() } };

        wrapper.vm.attachListener();
        expect(window.addEventListener).toHaveBeenCalledWith('message', wrapper.vm.onMessage);
        expect(window.removeEventListener).toHaveBeenCalledWith('message', wrapper.vm.onMessage);
        expect(wrapper.vm.$refs.iframeObj.contentWindow.postMessage).toHaveBeenCalled();
      });
    });

    describe('onMessage', () => {
      it('finishes tier2 if completed', async () => {
        helpers.timeout = jest.fn();
        wrapper.vm.tier2ProcessReset = jest.fn();
        EventHub.$emit = jest.fn();

        await wrapper.vm.onMessage({ data: { status: 'nope' } });
        expect(wrapper.vm.tier2ProcessReset).not.toHaveBeenCalled();
        expect(EventHub.$emit).not.toHaveBeenCalled();

        await wrapper.vm.onMessage({ data: { status: 'completed' } });
        expect(wrapper.vm.tier2ProcessReset).toHaveBeenCalled();
        expect(EventHub.$emit).toHaveBeenCalledWith('next');
      });
    });

    describe('tier2ProcessReset', () => {
      it('resets frame and removes listener', async () => {
        window.removeEventListener = jest.fn();

        await wrapper.setData({ iframeUrl: 'some url' });
        wrapper.vm.tier2ProcessReset();

        expect(window.removeEventListener).toHaveBeenCalledWith('message', wrapper.vm.onMessage);
        expect(wrapper.vm.iframeUrl).toBeFalsy();
      });
    });

    describe('tier2ProcessStart', () => {
      it('calls services and sets iframe', async () => {
        await wrapper.vm.tier2ProcessStart();

        expect(services.caseFiles.tier2ProcessStart).toHaveBeenCalledWith({
          id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
          identityVerificationTier1transactionId: 'tier1transactionId',
          locale: 'en',
          mainDocumentTypeId: 82,
          subDocumentTypeId: null,
        });
        expect(wrapper.vm.iframeUrl).toBe('some url');
      });
    });
  });
});
