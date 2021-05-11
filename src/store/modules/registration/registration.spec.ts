import { mockStore } from '@/store';
import { ECanadaProvinces, ERegistrationMethod, IRegistrationMenuItem } from '@/types';
import { tabs } from '@/store/modules/registration/tabs.mock';
import { mockHttpError } from '@/services/httpClient.mock';
import { Event, mockEventData, mockEvent } from '../../../entities/event';
import {
  EIndigenousTypes,
  mockGenders,
  mockIndigenousCommunitiesItems,
  mockIndigenousIdentitiesSearchData,
  mockIndigenousTypesItems,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
  mockBeneficiary,
  Beneficiary,
  mockCreateBeneficiaryResponse,
} from '../../../entities/beneficiary';

let store = mockStore();

describe('>>> Registration Module', () => {
  beforeEach(() => {
    store = mockStore();
  });

  describe('>> Getters', () => {
    describe('event', () => {
      it('returns a default event', () => {
        expect(store.getters['registration/event']).toEqual(new Event());
      });
    });

    describe('isLeftMenuOpen', () => {
      it('returns left menu status', () => {
        expect(store.getters['registration/isLeftMenuOpen']).toBeTruthy();
      });
    });

    describe('tabs', () => {
      it('returns tabs', () => {
        expect(store.getters['registration/tabs']).toEqual(tabs);
      });
    });

    describe('currentTabIndex', () => {
      it('returns current tab index', () => {
        expect(store.getters['registration/currentTabIndex']).toEqual(0);
      });
    });

    describe('currentTab', () => {
      it('returns current tab', () => {
        expect(store.getters['registration/currentTab']).toEqual(tabs[0]);
      });
    });

    describe('previousTabName', () => {
      it('returns previousTabName', () => {
        expect(store.getters['registration/previousTabName']).toEqual('registration.privacy_statement.start_registration');
      });
    });

    describe('nextTabName', () => {
      it('returns nextTabName', () => {
        expect(store.getters['registration/nextTabName']).toEqual(tabs[1].titleKey);
      });
    });

    describe('genders', () => {
      it('returns genders', () => {
        expect(store.getters['registration/genders']).toEqual([]);

        store.state.registration.genders = mockGenders();
        expect(store.getters['registration/genders']).toEqual(mockGenders());
      });
    });

    describe('preferredLanguages', () => {
      it('returns preferredLanguages', () => {
        expect(store.getters['registration/preferredLanguages']).toEqual([]);

        store.state.registration.preferredLanguages = mockPreferredLanguages();
        expect(store.getters['registration/preferredLanguages']).toEqual(mockPreferredLanguages());
      });
    });

    describe('primarySpokenLanguages', () => {
      it('returns primarySpokenLanguages', () => {
        expect(store.getters['registration/primarySpokenLanguages']).toEqual([]);

        store.state.registration.primarySpokenLanguages = mockPrimarySpokenLanguages();
        expect(store.getters['registration/primarySpokenLanguages']).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns indigenousTypesItems', () => {
        store.state.registration.indigenousIdentities[ECanadaProvinces.AB] = mockIndigenousIdentitiesSearchData().value;
        expect(store.getters['registration/indigenousTypesItems'](ECanadaProvinces.AB))
          .toEqual(mockIndigenousTypesItems());
      });
    });

    describe('indigenousCommunitiesItems', () => {
      it('returns indigenousCommunitiesItems', () => {
        store.state.registration.indigenousIdentities[ECanadaProvinces.AB] = mockIndigenousIdentitiesSearchData().value;
        expect(store.getters['registration/indigenousCommunitiesItems'](ECanadaProvinces.AB, EIndigenousTypes.FirstNations))
          .toEqual(mockIndigenousCommunitiesItems());
      });
    });

    describe('findEffectiveJumpIndex', () => {
      beforeEach(() => {
        store.getters.beneficiary = mockBeneficiary();
        store.getters['registration/beneficiary'].validatePersonalInformation = jest.fn(() => ['error']);
        store.getters['registration/beneficiary'].validateAddresses = jest.fn(() => ['error']);
        store.getters['registration/beneficiary'].validateHouseholdMembers = jest.fn(() => ['error']);
      });

      it('returns the target index when moving backwards', async () => {
        store.state.registration.currentTabIndex = 2;
        store.getters.beneficiary.noFixedHome = false;
        expect(store.getters['registration/findEffectiveJumpIndex'](1)).toEqual(1);
        expect(store.getters['registration/findEffectiveJumpIndex'](0)).toEqual(0);
      });

      it('returns the current index when no change', async () => {
        store.getters.beneficiary.noFixedHome = false;
        expect(store.getters['registration/findEffectiveJumpIndex'](0)).toEqual(0);
      });

      it('stops on the invalid PrivacyStatement form', async () => {
        store.getters.beneficiary.noFixedHome = false;
        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(0);
      });

      it('stops on the invalid PersonalInformation form', async () => {
        store.state.registration.isPrivacyAgreed = true;
        store.getters.beneficiary.noFixedHome = false;

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(1);
      });

      it('stops on the invalid Addresses form', async () => {
        store.state.registration.isPrivacyAgreed = true;
        store.getters.beneficiary.noFixedHome = false;

        store.getters['registration/beneficiary'].validatePersonalInformation = jest.fn(() => []);

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(2);
      });

      it('stops on the invalid Household Members form', async () => {
        store.state.registration.isPrivacyAgreed = true;
        store.getters.beneficiary.noFixedHome = false;

        store.getters['registration/beneficiary'].validatePersonalInformation = jest.fn(() => []);
        store.getters['registration/beneficiary'].validateAddresses = jest.fn(() => []);

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(3);
      });

      it('returns target index when all forms valid', async () => {
        store.state.registration.isPrivacyAgreed = true;
        store.getters.beneficiary.noFixedHome = false;

        store.getters['registration/beneficiary'].validatePersonalInformation = jest.fn(() => []);
        store.getters['registration/beneficiary'].validateAddresses = jest.fn(() => []);
        store.getters['registration/beneficiary'].validateHouseholdMembers = jest.fn(() => []);

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(6);
      });
    });

    describe('registrationResponse', () => {
      it('returns registrationResponse', () => {
        expect(store.getters['registration/registrationResponse']).toBeNull();

        const response = mockCreateBeneficiaryResponse();
        store.state.registration.registrationResponse = response;
        expect(store.getters['registration/registrationResponse']).toBe(response);
      });
    });

    describe('registrationErrors', () => {
      it('returns registrationErrors', () => {
        expect(store.getters['registration/registrationErrors']).toEqual([]);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setEvent', () => {
      it('sets the event', () => {
        expect(store.getters['registration/event']).toEqual(new Event());

        store.commit('registration/setEvent', mockEventData());

        expect(store.state.registration.event).toEqual(mockEventData());
      });
    });

    describe('toggleLeftMenu', () => {
      it('updates left menu status', () => {
        expect(store.getters['registration/isLeftMenuOpen']).toBeTruthy();

        store.commit('registration/toggleLeftMenu', false);

        expect(store.getters['registration/isLeftMenuOpen']).toBeFalsy();
      });
    });

    describe('setCurrentTabIndex', () => {
      it('updates the index of current tab', () => {
        expect(store.getters['registration/currentTabIndex']).toBe(0);

        const toIndex = 2;

        store.commit('registration/setCurrentTabIndex', toIndex);

        expect(store.getters['registration/currentTabIndex']).toBe(toIndex);
      });
    });

    describe('mutateCurrentTab', () => {
      it('mutates current tab', () => {
        expect(store.getters['registration/currentTab'].isValid).toBeTruthy();

        store.commit('registration/mutateCurrentTab', (tab: IRegistrationMenuItem) => {
          tab.isValid = false;
        });

        expect(store.getters['registration/currentTab'].isValid).toBeFalsy();
      });
    });

    describe('jump', () => {
      it('set current tab to be touched', async () => {
        const currentIndex = 0;
        const toIndex = 2;

        expect(store.getters['registration/tabs'][currentIndex].isTouched).toBeFalsy();

        await store.commit('registration/jump', toIndex);

        expect(store.getters['registration/tabs'][currentIndex].isTouched).toBeTruthy();
      });

      it('update the index of current tab', async () => {
        expect(store.getters['registration/currentTabIndex']).toEqual(0);

        const toIndex = 2;

        await store.commit('registration/jump', toIndex);

        expect(store.getters['registration/currentTabIndex']).toEqual(toIndex);
      });

      it('if target index is out of array bounds, stay at current tab', async () => {
        expect(store.getters['registration/currentTabIndex']).toEqual(0);

        let toIndex = -1;
        await store.commit('registration/jump', toIndex);
        expect(store.getters['registration/currentTabIndex']).toEqual(0);

        toIndex = 10;
        await store.commit('registration/jump', toIndex);
        expect(store.getters['registration/currentTabIndex']).toEqual(0);

        toIndex = tabs.length;
        await store.commit('registration/jump', toIndex);
        expect(store.getters['registration/currentTabIndex']).toEqual(0);
      });
    });

    describe('setIsPrivacyAgreed', () => {
      it('should set isPrivacyAgreed', () => {
        expect(store.state.registration.isPrivacyAgreed).toEqual(false);
        store.commit('registration/setIsPrivacyAgreed', true);
        expect(store.state.registration.isPrivacyAgreed).toEqual(true);
      });
    });

    describe('setDateTimeConsent', () => {
      it('should set privacyDateTimeConsent', () => {
        expect(store.state.registration.privacyDateTimeConsent).toEqual('');
        store.commit('registration/setDateTimeConsent', 'date');
        expect(store.state.registration.privacyDateTimeConsent).toEqual('date');
      });
    });

    describe('setGenders', () => {
      it('should set genders', () => {
        expect(store.state.registration.genders).toEqual([]);
        store.commit('registration/setGenders', mockGenders());
        expect(store.state.registration.genders).toEqual(mockGenders());
      });
    });

    describe('setPreferredLanguages', () => {
      it('should set preferredLanguages', () => {
        expect(store.state.registration.preferredLanguages).toEqual([]);
        store.commit('registration/setPreferredLanguages', mockPreferredLanguages());
        expect(store.state.registration.preferredLanguages).toEqual(mockPreferredLanguages());
      });
    });

    describe('setPrimarySpokenLanguages', () => {
      it('should set primarySpokenLanguages', () => {
        expect(store.state.registration.primarySpokenLanguages).toEqual([]);
        store.commit('registration/setPrimarySpokenLanguages', mockPrimarySpokenLanguages());
        expect(store.state.registration.primarySpokenLanguages).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('setIndigenousIdentities', () => {
      it('should set indigenousIdentities', () => {
        const payload = mockIndigenousIdentitiesSearchData().value[0];
        store.commit('registration/setIndigenousIdentities', { provinceCode: ECanadaProvinces.AB, identities: payload });
        expect(store.state.registration.indigenousIdentities[ECanadaProvinces.AB]).toEqual(payload);
      });
    });

    describe('setLoadingIndigenousIdentities', () => {
      it('should set loadingIndigenousIdentities', () => {
        expect(store.state.registration.loadingIndigenousIdentities).toEqual(false);
        store.commit('registration/setLoadingIndigenousIdentities', true);
        expect(store.state.registration.loadingIndigenousIdentities).toEqual(true);
      });
    });

    describe('setPrivacyCRCUsername', () => {
      it('should set privacyCRCUsername', () => {
        expect(store.state.registration.privacyCRCUsername).toEqual('');
        store.commit('registration/setPrivacyCRCUsername', 'user');
        expect(store.state.registration.privacyCRCUsername).toEqual('user');
      });
    });

    describe('setPrivacyRegistrationMethod', () => {
      it('should set privacyRegistrationMethod', () => {
        expect(store.state.registration.privacyRegistrationMethod).toEqual(null);
        store.commit('registration/setPrivacyRegistrationMethod', ERegistrationMethod.InPerson);
        expect(store.state.registration.privacyRegistrationMethod).toEqual(ERegistrationMethod.InPerson);
      });
    });

    describe('setPrivacyRegistrationLocationName', () => {
      it('should set privacyRegistrationLocationName', () => {
        expect(store.state.registration.privacyRegistrationLocationName).toEqual('');
        store.commit('registration/setPrivacyRegistrationLocationName', 'name');
        expect(store.state.registration.privacyRegistrationLocationName).toEqual('name');
      });
    });

    describe('setRegistrationResponse', () => {
      it('sets registration response', () => {
        expect(store.state.registration.registrationResponse).toBeNull();

        const response = mockCreateBeneficiaryResponse();
        store.commit('registration/setRegistrationResponse', response);

        expect(store.state.registration.registrationResponse).toEqual(response);
      });

      describe('setSubmitLoading', () => {
        it('sets setSubmitLoading', () => {
          expect(store.state.registration.submitLoading).toBeFalsy();

          store.commit('registration/setSubmitLoading', true);

          expect(store.state.registration.submitLoading).toBeTruthy();
        });
      });
    });

    describe('setRegistrationErrors', () => {
      it('sets registration error', () => {
        expect(store.state.registration.registrationErrors).toEqual([]);

        const errors = [mockHttpError()];
        store.commit('registration/setRegistrationErrors', errors);

        expect(store.state.registration.registrationErrors).toEqual(errors);
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchEvent', () => {
      it('calls the getEvent service', async () => {
        expect(store.$services.publicApi.searchEvents).toHaveBeenCalledTimes(0);

        await store.dispatch('registration/fetchEvent', { lang: 'en', registrationLink: 'link' });

        expect(store.$services.publicApi.searchEvents).toHaveBeenCalledTimes(1);
      });

      it('maps IEventData to IEvent, and sets the event', async () => {
        expect(store.getters['registration/event']).toEqual(new Event());

        await store.dispatch('registration/fetchEvent', {});

        expect(store.getters['registration/event']).toEqual(mockEvent());
      });
    });

    describe('fetchGenders', () => {
      it('call the getGenders service', async () => {
        await store.dispatch('registration/fetchGenders');

        expect(store.$services.beneficiaries.getGenders).toHaveBeenCalledTimes(1);
      });

      it('sets the genders', async () => {
        expect(store.getters['registration/genders']).toEqual([]);

        await store.dispatch('registration/fetchGenders');

        expect(store.state.registration.genders).toEqual(mockGenders());
      });
    });

    describe('fetchPreferredLanguages', () => {
      it('call the getPreferredLanguages service', async () => {
        await store.dispatch('registration/fetchPreferredLanguages');

        expect(store.$services.beneficiaries.getPreferredLanguages).toHaveBeenCalledTimes(1);
      });

      it('sets the preferredLanguages', async () => {
        expect(store.getters['registration/preferredLanguages']).toEqual([]);

        await store.dispatch('registration/fetchPreferredLanguages');

        expect(store.state.registration.preferredLanguages).toEqual(mockPreferredLanguages());
      });
    });

    describe('fetchPrimarySpokenLanguages', () => {
      it('call the getPrimaryLanguages service', async () => {
        await store.dispatch('registration/fetchPrimarySpokenLanguages');

        expect(store.$services.beneficiaries.getPrimarySpokenLanguages).toHaveBeenCalledTimes(1);
      });

      it('sets the primarySpokenLanguages', async () => {
        expect(store.getters['registration/primarySpokenLanguages']).toEqual([]);

        await store.dispatch('registration/fetchPrimarySpokenLanguages');

        expect(store.state.registration.primarySpokenLanguages).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('fetchIndigenousIdentitiesByProvince', () => {
      it('call the searchIndigenousIdentities service with proper params', async () => {
        const provinceCode = ECanadaProvinces.BC;
        await store.commit('registration/setEvent', mockEventData());
        await store.dispatch('registration/fetchIndigenousIdentitiesByProvince', provinceCode);

        expect(store.$services.beneficiaries.searchIndigenousIdentities).toHaveBeenCalledWith({
          filter: {
            Province: provinceCode,
            TenantId: 'tenant-guid',
          },
          top: 1000,
        });
      });

      it('sets the indigenousIdentities', async () => {
        await store.commit('registration/setEvent', mockEventData());

        await store.dispatch('registration/fetchIndigenousIdentitiesByProvince', ECanadaProvinces.AB);

        expect(store.state.registration.indigenousIdentities[ECanadaProvinces.AB])
          .toEqual(mockIndigenousIdentitiesSearchData().value);
      });
    });

    describe('submitRegistration', () => {
      it('call the submitRegistration service with proper params', async () => {
        store.state.beneficiary.beneficiary = mockBeneficiary() as Beneficiary;
        await store.commit('registration/setEvent', mockEventData());

        await store.dispatch('registration/submitRegistration');

        expect(store.$services.beneficiaries.submitRegistration).toHaveBeenCalledWith(mockBeneficiary(), mockEventData().eventId);
      });

      it('sets registrationResponse in case of success', async () => {
        expect(store.getters['registration/registrationResponse']).toBeNull();

        await store.commit('registration/setEvent', mockEventData());

        await store.dispatch('registration/submitRegistration');

        expect(store.getters['registration/registrationResponse']).toStrictEqual(mockCreateBeneficiaryResponse());
      });

      it('sets registrationErrors in case of error', async () => {
        await store.commit('registration/setEvent', mockEventData());
        store.$services.beneficiaries.submitRegistration = jest.fn(() => { throw new Error(); });
        await store.dispatch('registration/submitRegistration');
        expect(store.getters['registration/registrationErrors']).toStrictEqual(new Error());
      });
    });
  });
});
