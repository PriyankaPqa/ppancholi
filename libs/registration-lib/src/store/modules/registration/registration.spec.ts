/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockStore } from '@/store';
import { mockTabs } from '@/store/modules/registration/tabs.mock';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import { mockHttpError } from '@libs/services-lib/http-client';
import { mockSplitHousehold } from '@libs/entities-lib/household-create/householdCreate.mock';

import { HouseholdCreate } from '@libs/entities-lib/household-create/householdCreate';
import { RegistrationEvent, mockEventData, mockEvent } from '@libs/entities-lib/registration-event';
import {
  EIndigenousTypes,
  mockGenders,
  mockIndigenousCommunitiesItems,
  mockIndigenousCommunitiesGetData,
  mockIndigenousTypesItems,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
  mockHouseholdCreate, mockContactInformation, mockIdentitySet,
  mockMember, mockAddress, mockAdditionalMember, mockHouseholdCreateData, ECurrentAddressTypes,
  Member,
} from '@libs/entities-lib/household-create';

import { mockHouseholdEntity } from '@libs/entities-lib/household';
import { IRegistrationMenuItem } from '@/types';
import {
  ERegistrationMethod, ERegistrationMode,
} from '@libs/shared-lib/types';
import { getDefaultState, makeRegistrationModule } from './registration';

import * as registrationUtils from './registrationUtils';

let store = mockStore();

describe('>>> Registration Module', () => {
  beforeEach(() => {
    store = mockStore();
  });

  describe('>> State', () => {
    describe('Default state', () => {
      it('should return proper data', () => {
        expect(getDefaultState(mockTabs())).toEqual({
          isPrivacyAgreed: false,
          event: null,
          isLeftMenuOpen: true,
          tabs: mockTabs(),
          currentTabIndex: 0,
          genders: [],
          preferredLanguages: [],
          primarySpokenLanguages: [],
          indigenousCommunities: [],
          loadingIndigenousCommunities: false,
          registrationResponse: null,
          registrationErrors: null,
          submitLoading: false,
          inlineEditCounter: 0,
          householdResultsShown: false,
          householdCreate: new HouseholdCreate(),
          householdAlreadyRegistered: false,
          householdAssociationMode: false,
          splitHousehold: null,
          primarySpokenLanguagesFetched: false,
          gendersFetched: false,
        });
      });
    });
  });

  describe('>> Getters', () => {
    describe('isCRCRegistration', () => {
      it('returns isCRCRegistration', () => {
        expect(store.getters['registration/isCRCRegistration']).toEqual(false);

        store = mockStore({
          modules: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            registration: makeRegistrationModule({ mode: ERegistrationMode.CRC } as any),
          },
        });
        expect(store.getters['registration/isCRCRegistration']).toEqual(true);
      });
    });

    describe('event', () => {
      it('returns a default event', () => {
        expect(store.getters['registration/event']).toEqual(new RegistrationEvent());
      });
    });

    describe('isLeftMenuOpen', () => {
      it('returns left menu status', () => {
        expect(store.getters['registration/isLeftMenuOpen']).toBeTruthy();
      });
    });

    describe('tabs', () => {
      it('returns tabs', () => {
        expect(store.getters['registration/tabs']).toEqual(mockTabs());
      });
    });

    describe('currentTabIndex', () => {
      it('returns current tab index', () => {
        expect(store.getters['registration/currentTabIndex']).toEqual(0);
      });
    });

    describe('currentTab', () => {
      it('returns current tab', () => {
        expect(store.getters['registration/currentTab']).toEqual(mockTabs()[0]);
      });
    });

    describe('previousTabName', () => {
      it('returns previousTabName', () => {
        expect(store.getters['registration/previousTabName']).toEqual('registration.privacy_statement.start_registration');
      });
    });

    describe('nextTabName', () => {
      it('returns nextTabName', () => {
        expect(store.getters['registration/nextTabName']).toEqual(mockTabs()[1].titleKey);
      });
    });

    describe('genders', () => {
      it('returns active genders', () => {
        expect(store.getters['registration/genders']()).toEqual([]);

        store.state.registration.genders = mockGenders();
        expect(store.getters['registration/genders']().length).toEqual(3);
        expect(store.getters['registration/genders'](false).length).toEqual(3);
      });

      it('returns active and inactive genders', () => {
        expect(store.getters['registration/genders']()).toEqual([]);

        store.state.registration.genders = mockGenders();
        expect(store.getters['registration/genders'](true).length).toEqual(4);
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
      it('returns active primarySpokenLanguages', () => {
        expect(store.getters['registration/primarySpokenLanguages']()).toEqual([]);

        store.state.registration.primarySpokenLanguages = mockPrimarySpokenLanguages();
        expect(store.getters['registration/primarySpokenLanguages']().length).toEqual(3);
        expect(store.getters['registration/primarySpokenLanguages'](false).length).toEqual(3);
      });

      it('returns active and inactive primarySpokenLanguages', () => {
        expect(store.getters['registration/primarySpokenLanguages']()).toEqual([]);

        store.state.registration.primarySpokenLanguages = mockPrimarySpokenLanguages();
        expect(store.getters['registration/primarySpokenLanguages'](true).length).toEqual(4);
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns indigenousTypesItems', () => {
        store.state.registration.indigenousCommunities = mockIndigenousCommunitiesGetData();
        expect(store.getters['registration/indigenousTypesItems'])
          .toEqual(mockIndigenousTypesItems());
      });
    });

    describe('indigenousCommunitiesItems', () => {
      it('returns indigenousCommunitiesItems', () => {
        store.state.registration.indigenousCommunities = mockIndigenousCommunitiesGetData();
        expect(store.getters['registration/indigenousCommunitiesItems'](EIndigenousTypes.Metis))
          .toEqual([
            {
              text: 'Metis',
              value: '',
            },
          ]);
      });

      it('returns indigenousCommunitiesItems with other first if type is First Nation', () => {
        store.state.registration.indigenousCommunities = mockIndigenousCommunitiesGetData();
        expect(store.getters['registration/indigenousCommunitiesItems'](EIndigenousTypes.FirstNation))
          .toEqual(
            [{ value: 'other_id', text: 'Other' }, ...mockIndigenousCommunitiesItems()],
          );
      });
    });

    describe('findEffectiveJumpIndex', () => {
      beforeEach(() => {
        store.getters.household = mockHouseholdCreate();
        jest.spyOn(registrationUtils, 'isRegisteredValid').mockReturnValue(true);
      });

      it('returns the target index when moving backwards', async () => {
        store.state.registration.currentTabIndex = 2;
        store.getters.household.noFixedHome = false;
        expect(store.getters['registration/findEffectiveJumpIndex'](1)).toEqual(1);
        expect(store.getters['registration/findEffectiveJumpIndex'](0)).toEqual(0);
      });

      it('returns the current index when no change', async () => {
        store.getters.household.noFixedHome = false;
        expect(store.getters['registration/findEffectiveJumpIndex'](0)).toEqual(0);
      });

      it('stops on the invalid PrivacyStatement form', async () => {
        jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(false);
        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(0);
      });

      it('stops on the invalid PersonalInformation form', async () => {
        jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(true);
        jest.spyOn(registrationUtils, 'personalInformationValid').mockReturnValue(false);
        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(1);
      });

      it('stops on the invalid Addresses form', async () => {
        jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(true);
        jest.spyOn(registrationUtils, 'personalInformationValid').mockReturnValue(true);
        jest.spyOn(registrationUtils, 'addressesValid').mockReturnValue(false);
        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(2);
      });

      it('stops on the invalid Household Members form', async () => {
        jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(true);
        jest.spyOn(registrationUtils, 'personalInformationValid').mockReturnValue(true);
        jest.spyOn(registrationUtils, 'addressesValid').mockReturnValue(true);
        jest.spyOn(registrationUtils, 'additionalMembersValid').mockReturnValue(false);

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(3);
      });

      it('returns target index when all forms valid', async () => {
        jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(true);
        jest.spyOn(registrationUtils, 'personalInformationValid').mockReturnValue(true);
        jest.spyOn(registrationUtils, 'addressesValid').mockReturnValue(true);
        jest.spyOn(registrationUtils, 'additionalMembersValid').mockReturnValue(true);

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(6);
      });
    });

    describe('registrationResponse', () => {
      it('returns registrationResponse', () => {
        expect(store.getters['registration/registrationResponse']).toBeNull();

        const response = mockHouseholdEntity();
        store.state.registration.registrationResponse = response;
        expect(store.getters['registration/registrationResponse']).toBe(response);
      });
    });

    describe('registrationErrors', () => {
      it('returns registrationErrors', () => {
        expect(store.getters['registration/registrationErrors']).toEqual(null);
      });
    });

    describe('household', () => {
      it('returns a deep clone of the household', () => {
        expect(store.getters['registration/householdCreate']).toEqual(_cloneDeep(store.state.registration.householdCreate));
      });
    });

    describe('personalInformation', () => {
      it('returns a aggregation of contact information and member', () => {
        const expected = _merge(
          _cloneDeep(store.state.registration.householdCreate.primaryBeneficiary.contactInformation),
          _cloneDeep(store.state.registration.householdCreate.primaryBeneficiary.identitySet),
        );

        expect(store.getters['registration/personalInformation']).toEqual(expected);
      });
    });

    describe('isSplitMode', () => {
      it('returns true if splitHousehold object is not null', () => {
        store.state.registration.splitHousehold = { originHouseholdId: 'Id-1', splitMembers: null };
        expect(store.getters['registration/isSplitMode']).toBeTruthy();
      });

      it('returns false if splitHousehold object is  null', () => {
        store.state.registration.splitHousehold = null;
        expect(store.getters['registration/isSplitMode']).toBeFalsy();
      });
    });
  });
  /* eslint-disable max-statements */
  describe('>> Mutations', () => {
    describe('setEvent', () => {
      it('sets the event', () => {
        expect(store.getters['registration/event']).toEqual(new RegistrationEvent());

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

        toIndex = mockTabs().length;
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
        expect(store.state.registration.householdCreate.consentInformation.privacyDateTimeConsent).toEqual(null);
        store.commit('registration/setDateTimeConsent', 'date');
        expect(store.state.registration.householdCreate.consentInformation.privacyDateTimeConsent).toEqual('date');
      });
    });

    describe('setGenders', () => {
      it('should set genders', () => {
        expect(store.state.registration.genders).toEqual([]);
        store.commit('registration/setGenders', mockGenders());
        expect(store.state.registration.genders).toEqual(mockGenders());
      });
    });

    describe('setGendersFetched', () => {
      it('should set gendersFetched', () => {
        expect(store.state.registration.gendersFetched).toEqual(false);
        store.commit('registration/setGendersFetched', true);
        expect(store.state.registration.gendersFetched).toEqual(true);
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

    describe('setPrimarySpokenLanguagesFetched', () => {
      it('should set primarySpokenLanguagesFetched', () => {
        expect(store.state.registration.primarySpokenLanguagesFetched).toEqual(false);
        store.commit('registration/setPrimarySpokenLanguagesFetched', true);
        expect(store.state.registration.primarySpokenLanguagesFetched).toEqual(true);
      });
    });

    describe('setIndigenousCommunities', () => {
      it('should set indigenousCommunities', () => {
        const payload = mockIndigenousCommunitiesGetData()[0];
        store.commit('registration/setIndigenousCommunities', { communities: payload });
        expect(store.state.registration.indigenousCommunities).toEqual(payload);
      });
    });

    describe('setLoadingIndigenousCommunities', () => {
      it('should set loadingIndigenousCommunities', () => {
        expect(store.state.registration.loadingIndigenousCommunities).toEqual(false);
        store.commit('registration/setLoadingIndigenousCommunities', true);
        expect(store.state.registration.loadingIndigenousCommunities).toEqual(true);
      });
    });

    describe('sePrivacyCRCUsername', () => {
      it('should set cRCUsername', () => {
        expect(store.state.registration.householdCreate.consentInformation.crcUserName).toEqual(null);
        store.commit('registration/setPrivacyCRCUsername', 'user');
        expect(store.state.registration.householdCreate.consentInformation.crcUserName).toEqual('user');
      });
    });

    describe('setPrivacyRegistrationMethod', () => {
      it('should set registrationMethod', () => {
        expect(store.state.registration.householdCreate.consentInformation.registrationMethod).toEqual(null);
        store.commit('registration/setPrivacyRegistrationMethod', ERegistrationMethod.InPerson);
        expect(store.state.registration.householdCreate.consentInformation.registrationMethod).toEqual(ERegistrationMethod.InPerson);
      });
    });

    describe('setPrivacyRegistrationLocationId', () => {
      it('should set registrationLocationId', () => {
        expect(store.state.registration.householdCreate.consentInformation.registrationLocationId).toEqual(null);
        store.commit('registration/setPrivacyRegistrationLocationId', 'location id');
        expect(store.state.registration.householdCreate.consentInformation.registrationLocationId).toEqual('location id');
      });
    });

    describe('setRegistrationResponse', () => {
      it('sets registration response', () => {
        expect(store.state.registration.registrationResponse).toBeNull();

        const response = mockHouseholdEntity();
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
        expect(store.state.registration.registrationErrors).toEqual(null);

        const errors = [mockHttpError()];
        store.commit('registration/setRegistrationErrors', errors);

        expect(store.state.registration.registrationErrors).toEqual(errors);
      });
    });

    describe('resetState', () => {
      it('should reset the state to default', () => {
        const defaultState = getDefaultState(mockTabs());
        store.commit('registration/setEvent', mockEventData());
        store.commit('registration/resetState', mockTabs());
        expect(store.state.registration).toEqual(defaultState);
      });
    });

    describe('increaseInlineEditCounter', () => {
      it('should increase the inline counter', () => {
        store.commit('registration/increaseInlineEditCounter');
        expect(store.state.registration.inlineEditCounter).toEqual(1);
      });
    });

    describe('decreaseInlineEditCounter', () => {
      it('should increase the inline counter', () => {
        store.commit('registration/decreaseInlineEditCounter');
        expect(store.state.registration.inlineEditCounter).toEqual(0);

        store.commit('registration/increaseInlineEditCounter');

        store.commit('registration/decreaseInlineEditCounter');
        expect(store.state.registration.inlineEditCounter).toEqual(0);
      });
    });

    describe('setHouseholdResultsShown', () => {
      it('sets registration error', () => {
        expect(store.state.registration.householdResultsShown).toEqual(false);

        store.commit('registration/setHouseholdResultsShown', true);

        expect(store.state.registration.householdResultsShown).toEqual(true);
      });
    });

    describe('setPersonalInformation', () => {
      it('sets both member identitySet and contact information', () => {
        store = mockStore();
        const payload = _merge(mockContactInformation(), mockIdentitySet());

        store.commit('registration/setPersonalInformation', payload);

        expect(store.state.registration.householdCreate.primaryBeneficiary.contactInformation).toEqual(mockContactInformation());
        expect(store.state.registration.householdCreate.primaryBeneficiary.identitySet).toEqual(mockIdentitySet());
      });
    });

    describe('setPrimaryBeneficiary', () => {
      it('sets primary beneficiary of a household', () => {
        store = mockStore();
        const payload = mockMember();
        store.commit('registration/setPrimaryBeneficiary', payload);
        expect(store.state.registration.householdCreate.primaryBeneficiary).toEqual(mockMember());
      });
    });

    describe('setContactInformation', () => {
      it('sets contact information of a household', () => {
        store = mockStore();
        const payload = mockContactInformation();
        store.commit('registration/setContactInformation', payload);
        expect(store.state.registration.householdCreate.primaryBeneficiary.contactInformation).toEqual(mockContactInformation());
      });
    });

    describe('setHomeAddress', () => {
      it('sets home address of the household', () => {
        store = mockStore();
        store.commit('registration/setHomeAddress', mockAddress());
        expect(store.state.registration.householdCreate.homeAddress).toEqual(mockAddress());
      });
    });

    describe('setCurrentAddress', () => {
      it('sets current address of the primaryBeneficiary', () => {
        store = mockStore();
        store.commit('registration/setCurrentAddress', mockAddress());
        expect(store.state.registration.householdCreate.primaryBeneficiary.currentAddress).toEqual(mockAddress());
      });

      it('sets current address of any additional members having the same current address as beneficiary', () => {
        store = mockStore();
        store.state.registration.householdCreate = new HouseholdCreate();
        store.commit('registration/setCurrentAddress', mockAddress());
        store.commit('registration/addAdditionalMember', { payload: mockAdditionalMember(), sameAddress: true });
        store.commit('registration/addAdditionalMember', { payload: mockAdditionalMember(), sameAddress: false });
        expect(store.state.registration.householdCreate.additionalMembers[0].currentAddress).toEqual(mockAddress());
        expect(store.state.registration.householdCreate.additionalMembers[1].currentAddress).not.toEqual(mockAddress());
      });
    });

    describe('setNoFixedHome', () => {
      it('sets noFixedHome', () => {
        store = mockStore();
        store.commit('registration/setNoFixedHome', true);
        expect(store.state.registration.householdCreate.noFixedHome).toEqual(true);
      });
    });

    describe('addAdditionalMember', () => {
      it('should call method from household entity with proper parameters', () => {
        store.state.registration.householdCreate = new HouseholdCreate();
        jest.spyOn(store.state.registration.householdCreate, 'addAdditionalMember');
        const params = { payload: mockAdditionalMember(), sameAddress: true };
        store.commit('registration/addAdditionalMember', params);
        expect(store.state.registration.householdCreate.addAdditionalMember).toHaveBeenCalledWith(params.payload, params.sameAddress);
      });
    });

    describe('removeAdditionalMember', () => {
      it('should call method from household entity with proper parameters', () => {
        store.state.registration.householdCreate = new HouseholdCreate();
        jest.spyOn(store.state.registration.householdCreate, 'removeAdditionalMember');
        store.commit('registration/removeAdditionalMember', 1);
        expect(store.state.registration.householdCreate.removeAdditionalMember).toHaveBeenCalledWith(1);
      });
    });

    describe('editAdditionalMember', () => {
      it('should call method from household entity with proper parameters', () => {
        store.state.registration.householdCreate = new HouseholdCreate();
        store.state.registration.householdCreate.editAdditionalMember = jest.fn();
        const params = { payload: mockAdditionalMember(), sameAddress: true, index: 1 };
        store.commit('registration/editAdditionalMember', params);
        expect(store.state.registration.householdCreate.editAdditionalMember).toHaveBeenCalledWith(
          _cloneDeep(params.payload),
          params.index,
          params.sameAddress,
        );
      });
    });

    describe('resetHouseholdCreate', () => {
      it('should reset the state to default', () => {
        store.commit('registration/setPrimaryBeneficiary', mockMember());
        store.commit('registration/resetHouseholdCreate');
        expect(store.state.registration.householdCreate).toEqual(new HouseholdCreate());
      });
    });

    describe('setHouseholdAssociationMode', () => {
      it('should set householdAssociationMode', () => {
        store.commit('registration/setHouseholdAssociationMode', true);
        expect(store.state.registration.householdAssociationMode).toEqual(true);
      });
    });

    describe('setHouseholdAlreadyRegistered', () => {
      it('should set householdAlreadyRegistered', () => {
        store.commit('registration/setHouseholdAlreadyRegistered', true);
        expect(store.state.registration.householdAlreadyRegistered).toEqual(true);
      });
    });

    describe('setHouseholdCreate', () => {
      it('should set householdCreate', () => {
        store.commit('registration/setHouseholdCreate', mockHouseholdCreateData());
        expect(store.state.registration.householdCreate).toEqual(new HouseholdCreate(mockHouseholdCreateData()));
      });
    });

    describe('setSplitHousehold', () => {
      it('should set splitHousehold', () => {
        const { originHouseholdId } = mockSplitHousehold();
        const { primaryMember } = mockSplitHousehold().splitMembers;
        const { additionalMembers } = mockSplitHousehold().splitMembers;
        store.commit('registration/setSplitHousehold', { originHouseholdId, primaryMember, additionalMembers });
        expect(store.state.registration.splitHousehold).toEqual(mockSplitHousehold());
      });
    });

    describe('resetSplitHousehold', () => {
      it('should reset splitHousehold', () => {
        store.commit('registration/resetSplitHousehold');
        expect(store.state.registration.splitHousehold).toEqual(null);
        expect(store.state.registration.event).toEqual(null);
        expect(store.state.registration.registrationErrors).toEqual(null);
        expect(store.state.registration.registrationResponse).toEqual(null);
        expect(store.state.registration.currentTabIndex).toEqual(0);
        expect(store.state.registration.isPrivacyAgreed).toEqual(false);
        expect(store.state.registration.householdResultsShown).toEqual(false);
      });
    });

    describe('setTabs', () => {
      it('should set tabs', () => {
        const tabs = mockTabs();
        store.commit('registration/setTabs', tabs);
        expect(store.state.registration.tabs).toEqual(tabs);
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
        expect(store.getters['registration/event']).toEqual(new RegistrationEvent());

        await store.dispatch('registration/fetchEvent', {});

        expect(store.getters['registration/event']).toEqual(mockEvent());
      });
    });

    describe('fetchGenders', () => {
      it('call the getGenders service', async () => {
        await store.dispatch('registration/fetchGenders');

        expect(store.$services.households.getGenders).toHaveBeenCalledTimes(1);
      });

      it('sets the genders', async () => {
        expect(store.getters['registration/genders']()).toEqual([]);

        await store.dispatch('registration/fetchGenders');

        expect(store.state.registration.genders).toEqual(mockGenders());
      });
    });

    describe('fetchPreferredLanguages', () => {
      it('call the getPreferredLanguages service', async () => {
        await store.dispatch('registration/fetchPreferredLanguages');

        expect(store.$services.households.getPreferredLanguages).toHaveBeenCalledTimes(1);
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

        expect(store.$services.households.getPrimarySpokenLanguages).toHaveBeenCalledTimes(1);
      });

      it('sets the primarySpokenLanguages', async () => {
        expect(store.getters['registration/primarySpokenLanguages']()).toEqual([]);

        await store.dispatch('registration/fetchPrimarySpokenLanguages');

        expect(store.state.registration.primarySpokenLanguages).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('fetchIndigenousCommunities', () => {
      it('call the getIndigenousCommunities service with proper params', async () => {
        await store.commit('registration/setEvent', mockEventData());
        await store.dispatch('registration/fetchIndigenousCommunities');

        expect(store.$services.households.getIndigenousCommunities).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitRegistration', () => {
      it('calls difference service according to mode', async () => {
        await store.commit('registration/setEvent', mockEventData());
        await store.dispatch('registration/submitRegistration');

        expect(store.$services.households.submitRegistration).toHaveBeenCalledTimes(1);
        expect(store.$services.households.submitCRCRegistration).toHaveBeenCalledTimes(0);

        store = mockStore({
          modules: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            registration: makeRegistrationModule({ mode: ERegistrationMode.CRC } as any),
          },
        });
        await store.commit('registration/setEvent', mockEventData());
        await store.dispatch('registration/submitRegistration', 'recaptchaToken');

        expect(store.$services.households.submitRegistration).toHaveBeenCalledTimes(0);
        expect(store.$services.households.submitCRCRegistration).toHaveBeenCalledTimes(1);
      });

      it('call the submitRegistration service with proper params', async () => {
        store.state.registration.householdCreate = mockHouseholdCreate() as HouseholdCreate;
        await store.commit('registration/setEvent', mockEventData());

        await store.dispatch('registration/submitRegistration', 'recaptchaToken');

        expect(store.$services.households.submitRegistration).toHaveBeenCalledWith({
          household: store.state.registration.householdCreate,
          eventId: mockEventData().id,
          recaptchaToken: 'recaptchaToken',
        });
      });

      it('sets registrationResponse in case of success', async () => {
        expect(store.getters['registration/registrationResponse']).toBeNull();

        await store.commit('registration/setEvent', mockEventData());

        await store.dispatch('registration/submitRegistration');

        expect(store.getters['registration/registrationResponse']).toStrictEqual(mockHouseholdEntity());
      });

      it('sets registrationErrors in case of error', async () => {
        const error = { response: { data: { errors: 'mock-errors' } } };
        await store.commit('registration/setEvent', mockEventData());
        store.$services.households.submitRegistration = jest.fn(() => {
          throw error;
        });
        await store.dispatch('registration/submitRegistration');
        expect(store.getters['registration/registrationErrors']).toEqual({ response: { data: { errors: 'mock-errors' } } });
      });
    });

    describe('updatePersonIdentity', () => {
      it('call the updatePersonIdentity service with proper params', async () => {
        const member = mockMember();
        const isPrimaryMember = false;
        const index = 1;

        store.state.registration.householdCreate.editAdditionalMember = jest.fn();
        await store.dispatch('registration/updatePersonIdentity', { member, isPrimaryMember, index });

        expect(store.$services.households.updatePersonIdentity).toHaveBeenCalledWith(member.id,
          { identitySet: member.identitySet, contactInformation: member.contactInformation });
      });

      it('calls the right mutation when member is primary', async () => {
        const member = mockMember();
        const isPrimaryMember = true;
        store.commit = jest.fn();
        store.$services.households.updatePersonIdentity = jest.fn(() => ({ id: 'foo' })) as any;

        await store.dispatch('registration/updatePersonIdentity', { member, isPrimaryMember });

        expect(store.commit).toHaveBeenCalledWith('registration/setPersonalInformation', { ...member.contactInformation, ...member.identitySet }, undefined);
      });

      it('calls the right mutation when member is not primary', async () => {
        const member = mockMember();
        const isPrimaryMember = false;
        const index = 0;
        store.commit = jest.fn();
        store.$services.households.updatePersonIdentity = jest.fn(() => ({ id: 'foo' })) as any;

        await store.dispatch('registration/updatePersonIdentity', { member, isPrimaryMember, index });

        expect(store.commit).toHaveBeenCalledWith('registration/editAdditionalMember', { payload: member, index, sameAddress: false }, undefined);
      });
    });

    describe('updatePersonContactInformation', () => {
      it('call the updatePersonContactInformation service with proper params', async () => {
        const member = mockMember();
        const isPrimaryMember = false;
        const index = 1;

        store.state.registration.householdCreate.editAdditionalMember = jest.fn();
        await store.dispatch('registration/updatePersonContactInformation', { member, isPrimaryMember, index });

        expect(store.$services.households.updatePersonContactInformation).toHaveBeenCalledWith(member.id,
          { contactInformation: member.contactInformation, identitySet: member.identitySet, isPrimaryBeneficiary: isPrimaryMember });
      });

      it('calls the right mutation when member is primary', async () => {
        const member = mockMember();
        const isPrimaryMember = true;
        store.commit = jest.fn();
        store.$services.households.updatePersonContactInformation = jest.fn(() => ({ id: 'foo' })) as any;

        await store.dispatch('registration/updatePersonContactInformation', { member, isPrimaryMember });

        expect(store.commit).toHaveBeenCalledWith('registration/setPersonalInformation', { ...member.contactInformation, ...member.identitySet }, undefined);
      });

      it('calls the right mutation when member is not primary', async () => {
        const member = mockMember();
        const isPrimaryMember = false;
        const index = 0;
        store.commit = jest.fn();
        store.$services.households.updatePersonContactInformation = jest.fn(() => ({ id: 'foo' })) as any;

        await store.dispatch('registration/updatePersonContactInformation', { member, isPrimaryMember, index });

        expect(store.commit).toHaveBeenCalledWith('registration/editAdditionalMember', { payload: member, index, sameAddress: false }, undefined);
      });
    });

    describe('updatePersonAddress', () => {
      it('call the updatePersonAddress service with proper params if the member is primary', async () => {
        const member = mockMember();
        const isPrimaryMember = true;

        // store.state.registration.householdCreate.editAdditionalMember = jest.fn();
        await store.dispatch('registration/updatePersonAddress', { member, isPrimaryMember });

        expect(store.$services.households.updatePersonAddress).toHaveBeenCalledWith(member.id, member.currentAddress);
      });

      it('calls the right mutation when member is primary', async () => {
        const member = mockMember();
        const isPrimaryMember = true;
        store.commit = jest.fn();
        store.$services.households.updatePersonAddress = jest.fn(() => ({ id: 'foo' })) as any;

        await store.dispatch('registration/updatePersonAddress', { member, isPrimaryMember });

        expect(store.commit).toHaveBeenCalledWith('registration/setCurrentAddress', member.currentAddress, undefined);
      });

      it('call the updatePersonAddress service and mutation with proper params when member is not primary and sameAddress is false', async () => {
        const member = mockMember();
        const isPrimaryMember = false;
        const index = 1;
        const sameAddress = false;
        store.state.registration.householdCreate.editAdditionalMember = jest.fn();
        store.commit = jest.fn();

        await store.dispatch('registration/updatePersonAddress', {
          member, isPrimaryMember, index, sameAddress,
        });

        expect(store.$services.households.updatePersonAddress).toHaveBeenCalledWith(member.id, member.currentAddress);
        expect(store.commit).toHaveBeenCalledWith('registration/editAdditionalMember', { payload: member, index, sameAddress: false }, undefined);
      });

      it('call the updatePersonAddress service and mutation with proper params when member is not primary and sameAddress is true', async () => {
        await store.commit('registration/setPrimaryBeneficiary', mockMember({
          currentAddress: {
            ...mockMember().currentAddress,
            addressType: ECurrentAddressTypes.Other,
          },
        }));
        const member = mockMember();
        const isPrimaryMember = false;
        const index = 1;
        const sameAddress = true;
        store.state.registration.householdCreate.editAdditionalMember = jest.fn();
        store.commit = jest.fn();

        await store.dispatch('registration/updatePersonAddress', {
          member, isPrimaryMember, index, sameAddress,
        });

        expect(store.$services.households.updatePersonAddress).toHaveBeenCalledWith(member.id, {
          ...mockMember().currentAddress,
          addressType: ECurrentAddressTypes.Other,
        });

        expect(store.commit).toHaveBeenCalledWith('registration/editAdditionalMember', { payload: member, index, sameAddress: true }, undefined);
      });
    });

    describe('addAdditionalMember', () => {
      it('call the addAdditionalMember service with proper params', async () => {
        const member = mockMember();
        const householdId = 'test';
        const sameAddress = true;
        store.commit = jest.fn();
        store.$services.households.addMember = jest.fn(() => (mockHouseholdEntity()));

        await store.dispatch('registration/addAdditionalMember', { householdId, member, sameAddress });

        expect(store.$services.households.addMember).toHaveBeenCalledWith(householdId, member);
      });

      it('call the mutation after the resolution', async () => {
        const member = mockMember();
        const householdId = 'test';
        const sameAddress = true;
        const mockhousehold = mockHouseholdEntity();
        store.commit = jest.fn();
        store.$services.households.addMember = jest.fn(() => (mockHouseholdEntity()));

        await store.dispatch('registration/addAdditionalMember', { householdId, member, sameAddress });

        expect(store.commit).toHaveBeenCalledWith('registration/addAdditionalMember',
          { payload: new Member({ ...member, id: mockhousehold.members[mockhousehold.members.length - 1] }), sameAddress }, undefined);
      });
    });

    describe('deleteAdditionalMember', () => {
      it('call the deleteAdditionalMember service with proper params', async () => {
        const memberId = mockMember().id;
        const householdId = 'test';
        store.commit = jest.fn();
        store.$services.households.deleteAdditionalMember = jest.fn(() => (mockHouseholdEntity()));

        await store.dispatch('registration/deleteAdditionalMember', { householdId, memberId });

        expect(store.$services.households.deleteAdditionalMember).toHaveBeenCalledWith(householdId, memberId);
      });

      it('call the mutation after the resolution', async () => {
        const memberId = mockMember().id;
        const householdId = 'test';
        const mockhousehold = mockHouseholdEntity();
        const index = mockhousehold.members.length - 1;
        store.commit = jest.fn();
        store.$services.households.deleteAdditionalMember = jest.fn(() => (mockHouseholdEntity()));

        await store.dispatch('registration/deleteAdditionalMember', { householdId, memberId, index });

        expect(store.commit).toHaveBeenCalledWith('registration/removeAdditionalMember', index, undefined);
      });
    });

    describe('splitHousehold', () => {
      it('call the splitHousehold service with proper params', async () => {
        store.$services.households.splitHousehold = jest.fn(() => (mockHouseholdEntity()));
        store.state.registration.householdCreate = mockHouseholdCreate() as HouseholdCreate;
        store.state.registration.splitHousehold = mockSplitHousehold();
        store.state.registration.event = mockEvent({ id: 'event-id' });
        await store.dispatch('registration/splitHousehold');
        expect(store.$services.households.splitHousehold).toHaveBeenCalledWith(mockHouseholdCreate(), mockSplitHousehold().originHouseholdId, 'event-id');
      });

      it('call the mutation setRegistrationResponse after the resolution', async () => {
        store.$services.households.splitHousehold = jest.fn(() => (mockHouseholdEntity()));
        store.state.registration.householdCreate = mockHouseholdCreate() as HouseholdCreate;
        store.state.registration.splitHousehold = mockSplitHousehold();
        store.state.registration.event = mockEvent({ id: 'event-id' });
        store.commit = jest.fn();
        await store.dispatch('registration/splitHousehold');
        expect(store.commit).toHaveBeenCalledWith('registration/setRegistrationResponse', mockHouseholdEntity(), undefined);
      });

      it('call the mutation setRegistrationErrors if the call ', async () => {
        store.$services.households.splitHousehold = jest.fn(() => {
          throw new Error();
        });
        store.state.registration.householdCreate = mockHouseholdCreate() as HouseholdCreate;
        store.state.registration.splitHousehold = mockSplitHousehold();
        store.state.registration.event = mockEvent({ id: 'event-id' });
        store.commit = jest.fn();

        await store.dispatch('registration/splitHousehold');
        expect(store.commit).toHaveBeenCalledWith('registration/setRegistrationErrors', new Error(), undefined);
      });
    });
  });
});
