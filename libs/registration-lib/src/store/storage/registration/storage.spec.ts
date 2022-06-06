/* eslint-disable max-statements */
import { mockStore } from '@/store';
import { mockTabs } from '@/store/modules/registration/tabs.mock';
import _merge from 'lodash/merge';
import { mockContactInformation } from '@/entities/value-objects/contact-information';
import { mockAdditionalMember, mockMember } from '@/entities/value-objects/member';
import { mockIdentitySet } from '@/entities/value-objects/identity-set';
import { mockAddress } from '@/entities/value-objects/address';
import { mockCampGround } from '@/entities/value-objects/current-address';
import { mockHouseholdCreateData, mockSplitHousehold } from '@/entities/household-create';
import { mockHttpError } from '@libs/core-lib/services/http-client';
import { makeStorage } from './storage';
import { mockEventData } from '../../../entities/event';
import { ERegistrationMethod, IRegistrationMenuItem } from '../../../types';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Registration Storage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('>> Getters', () => {
    it('should proxy isCRCRegistration', () => {
      expect(storage.getters.isCRCRegistration()).toEqual(store.getters['registration/isCRCRegistration']);
    });

    it('should proxy event', () => {
      expect(storage.getters.event()).toEqual(store.getters['registration/event']);
    });

    it('should proxy left menu status', () => {
      expect(storage.getters.isLeftMenuOpen()).toEqual(store.getters['registration/isLeftMenuOpen']);
    });

    it('should proxy tabs', () => {
      expect(storage.getters.tabs()).toEqual(store.getters['registration/tabs']);
    });

    it('should proxy current tab', () => {
      expect(storage.getters.currentTab()).toEqual(store.getters['registration/currentTab']);
    });

    it('should proxy current tab index', () => {
      expect(storage.getters.currentTabIndex()).toEqual(store.getters['registration/currentTabIndex']);
    });

    it('should proxy previousTabName', () => {
      expect(storage.getters.previousTabName()).toEqual(store.getters['registration/previousTabName']);
    });

    it('should proxy nextTabName', () => {
      expect(storage.getters.nextTabName()).toEqual(store.getters['registration/nextTabName']);
    });

    it('should proxy current genders', () => {
      expect(storage.getters.genders()).toEqual(store.getters['registration/genders'](false));
      expect(storage.getters.genders(true)).toEqual(store.getters['registration/genders'](true));
      expect(storage.getters.genders(false)).toEqual(store.getters['registration/genders'](false));
    });

    it('should proxy current preferredLanguages', () => {
      expect(storage.getters.preferredLanguages()).toEqual(store.getters['registration/preferredLanguages']);
    });

    it('should proxy current primarySpokenLanguages', () => {
      expect(storage.getters.primarySpokenLanguages()).toEqual(store.getters['registration/primarySpokenLanguages'](false));
      expect(storage.getters.primarySpokenLanguages(true)).toEqual(store.getters['registration/primarySpokenLanguages'](true));
      expect(storage.getters.primarySpokenLanguages(false)).toEqual(store.getters['registration/primarySpokenLanguages'](false));
    });

    it('should proxy current indigenousTypesItems', () => {
      expect(storage.getters.indigenousTypesItems())
        .toEqual(store.getters['registration/indigenousTypesItems']);
    });

    it('should proxy current indigenousCommunitiesItems', () => {
      expect(storage.getters.indigenousCommunitiesItems(1))
        .toEqual(store.getters['registration/indigenousCommunitiesItems'](1));
    });

    it('should proxy registrationResponse', () => {
      expect(storage.getters.registrationResponse()).toEqual(store.getters['registration/registrationResponse']);
    });

    it('should proxy registrationErrors', () => {
      expect(storage.getters.registrationErrors()).toEqual(store.getters['registration/registrationErrors']);
    });

    it('should proxy householdCreate', () => {
      expect(storage.getters.householdCreate()).toEqual(store.getters['registration/householdCreate']);
    });

    it('should proxy personalInformation', () => {
      expect(storage.getters.personalInformation()).toEqual(store.getters['registration/personalInformation']);
    });
    it('should proxy isSplitMode', () => {
      expect(storage.getters.isSplitMode()).toEqual(store.getters['registration/isSplitMode']);
    });
  });

  describe('>> Mutations', () => {
    it('should proxy toggleLeftMenu', () => {
      const payload = true;
      storage.mutations.toggleLeftMenu(payload);
      expect(store.commit).toBeCalledWith('registration/toggleLeftMenu', payload);
    });

    it('should proxy setCurrentTabIndex', () => {
      const payload = 3;
      storage.mutations.setCurrentTabIndex(payload);
      expect(store.commit).toBeCalledWith('registration/setCurrentTabIndex', payload);
    });

    it('should proxy mutateCurrentTab', () => {
      const payload = (tab: IRegistrationMenuItem) => {
        tab.isValid = false;
      };
      storage.mutations.mutateCurrentTab(payload);
      expect(store.commit).toBeCalledWith('registration/mutateCurrentTab', payload);
    });

    it('should proxy jump', () => {
      const toIndex = 2;
      storage.mutations.jump(toIndex);
      expect(store.commit).toBeCalledWith('registration/jump', toIndex);
    });

    it('should proxy setDateTimeConsent', () => {
      const privacyDateTimeConsent = 'date time consent';
      storage.mutations.setDateTimeConsent(privacyDateTimeConsent);
      expect(store.commit).toBeCalledWith('registration/setDateTimeConsent', privacyDateTimeConsent);
    });

    it('should proxy setEvent', () => {
      const payload = mockEventData();
      storage.mutations.setEvent(payload);
      expect(store.commit).toBeCalledWith('registration/setEvent', payload);
    });

    it('should proxy setPrivacyCRCUsername', () => {
      const payload = 'test';
      storage.mutations.setPrivacyCRCUsername(payload);
      expect(store.commit).toBeCalledWith('registration/setPrivacyCRCUsername', payload);
    });

    it('should proxy setPrivacyRegistrationMethod', () => {
      const payload = ERegistrationMethod.Phone;
      storage.mutations.setPrivacyRegistrationMethod(payload);
      expect(store.commit).toBeCalledWith('registration/setPrivacyRegistrationMethod', payload);
    });

    it('should proxy setPrivacyRegistrationLocationId', () => {
      const payload = 'name';
      storage.mutations.setPrivacyRegistrationLocationId(payload);
      expect(store.commit).toBeCalledWith('registration/setPrivacyRegistrationLocationId', payload);
    });

    it('should proxy resetState', () => {
      const payload = mockTabs();
      storage.mutations.resetState(mockTabs());
      expect(store.commit).toBeCalledWith('registration/resetState', payload);
    });

    it('should proxy increaseInlineEditCounter', () => {
      storage.mutations.increaseInlineEditCounter();
      expect(store.commit).toBeCalledWith('registration/increaseInlineEditCounter');
    });

    it('should proxy decreaseInlineEditCounter', () => {
      storage.mutations.decreaseInlineEditCounter();
      expect(store.commit).toBeCalledWith('registration/decreaseInlineEditCounter');
    });

    it('should proxy setHouseholdResultsShown', () => {
      storage.mutations.setHouseholdResultsShown(true);
      expect(store.commit).toBeCalledWith('registration/setHouseholdResultsShown', true);
    });

    it('should proxy setPersonalInformation', () => {
      const payload = _merge(mockContactInformation(), mockIdentitySet());
      storage.mutations.setPersonalInformation(payload);
      expect(store.commit).toBeCalledWith('registration/setPersonalInformation', payload);
    });

    it('should proxy setPrimaryBeneficiary', () => {
      const payload = mockMember();
      storage.mutations.setPrimaryBeneficiary(payload);
      expect(store.commit).toBeCalledWith('registration/setPrimaryBeneficiary', payload);
    });

    it('should proxy setIdentity', () => {
      const payload = mockIdentitySet();
      storage.mutations.setIdentity(payload);
      expect(store.commit).toBeCalledWith('registration/setIdentity', payload);
    });

    it('should proxy setIndigenousIdentity', () => {
      const payload = mockIdentitySet();
      storage.mutations.setIndigenousIdentity(payload);
      expect(store.commit).toBeCalledWith('registration/setIndigenousIdentity', payload);
    });

    it('should proxy setContactInformation', () => {
      const payload = mockContactInformation();
      storage.mutations.setContactInformation(payload);
      expect(store.commit).toBeCalledWith('registration/setContactInformation', payload);
    });

    it('should proxy setHomeAddress', () => {
      const payload = mockAddress();
      storage.mutations.setHomeAddress(payload);
      expect(store.commit).toBeCalledWith('registration/setHomeAddress', payload);
    });

    it('should proxy setCurrentAddress', () => {
      const payload = mockCampGround();
      storage.mutations.setCurrentAddress(payload);
      expect(store.commit).toBeCalledWith('registration/setCurrentAddress', payload);
    });

    it('should proxy setNoFixedHome', () => {
      storage.mutations.setNoFixedHome(true);
      expect(store.commit).toBeCalledWith('registration/setNoFixedHome', true);
    });

    it('should proxy addAdditionalMember', () => {
      storage.mutations.addAdditionalMember(mockAdditionalMember(), true);
      const params = { payload: mockAdditionalMember(), sameAddress: true };
      expect(store.commit).toBeCalledWith('registration/addAdditionalMember', params);
    });

    it('should proxy removeAdditionalMember', () => {
      storage.mutations.removeAdditionalMember(1);
      expect(store.commit).toBeCalledWith('registration/removeAdditionalMember', 1);
    });

    it('should proxy editAdditionalMember', () => {
      storage.mutations.editAdditionalMember(mockAdditionalMember(), 0, true);
      const params = { payload: mockAdditionalMember(), sameAddress: true, index: 0 };
      expect(store.commit).toBeCalledWith('registration/editAdditionalMember', params);
    });

    it('should proxy resetHouseholdCreate', () => {
      storage.mutations.resetHouseholdCreate();
      expect(store.commit).toBeCalledWith('registration/resetHouseholdCreate');
    });

    it('should proxy setHouseholdAlreadyRegistered', () => {
      storage.mutations.setHouseholdAlreadyRegistered(true);
      expect(store.commit).toBeCalledWith('registration/setHouseholdAlreadyRegistered', true);
    });

    it('should proxy setHouseholdAssociationMode', () => {
      storage.mutations.setHouseholdAssociationMode(true);
      expect(store.commit).toBeCalledWith('registration/setHouseholdAssociationMode', true);
    });

    it('should proxy setHouseholdCreate', () => {
      storage.mutations.setHouseholdCreate(mockHouseholdCreateData());
      expect(store.commit).toBeCalledWith('registration/setHouseholdCreate', mockHouseholdCreateData());
    });

    it('should proxy setRegistrationErrors', () => {
      const errors = [mockHttpError()];
      storage.mutations.setRegistrationErrors(errors);
      expect(store.commit).toBeCalledWith('registration/setRegistrationErrors', errors);
    });

    it('should proxy setSplitHousehold', () => {
      const { originHouseholdId } = mockSplitHousehold();
      const { primaryMember } = mockSplitHousehold().splitMembers;
      const { additionalMembers } = mockSplitHousehold().splitMembers;
      storage.mutations.setSplitHousehold({ originHouseholdId, primaryMember, additionalMembers });
      expect(store.commit).toBeCalledWith('registration/setSplitHousehold', { originHouseholdId, primaryMember, additionalMembers });
    });

    it('should proxy resetSplitHousehold', () => {
      storage.mutations.resetSplitHousehold();
      expect(store.commit).toBeCalledWith('registration/resetSplitHousehold');
    });

    it('should proxy setTabs', () => {
      const tabs = mockTabs();
      storage.mutations.setTabs(tabs);
      expect(store.commit).toBeCalledWith('registration/setTabs', tabs);
    });

    it('should proxy setPrimarySpokenLanguagesFetched', () => {
      storage.mutations.setPrimarySpokenLanguagesFetched(true);
      expect(store.commit).toBeCalledWith('registration/setPrimarySpokenLanguagesFetched', true);
    });

    it('should proxy setGendersFetched', () => {
      storage.mutations.setGendersFetched(true);
      expect(store.commit).toBeCalledWith('registration/setGendersFetched', true);
    });

    it('should proxy setRegistrationResponse', () => {
      storage.mutations.setRegistrationResponse(null);
      expect(store.commit).toBeCalledWith('registration/setRegistrationResponse', null);
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchEvent', () => {
      const lang = 'en';
      const registrationLink = 'test link';
      storage.actions.fetchEvent(lang, registrationLink);
      expect(store.dispatch).toBeCalledWith('registration/fetchEvent', { lang, registrationLink });
    });

    it('should proxy fetchGenders', () => {
      storage.actions.fetchGenders();
      expect(store.dispatch).toBeCalledWith('registration/fetchGenders');
    });

    it('should proxy fetchPreferredLanguages', () => {
      storage.actions.fetchPreferredLanguages();
      expect(store.dispatch).toBeCalledWith('registration/fetchPreferredLanguages');
    });

    it('should proxy fetchPrimarySpokenLanguages', () => {
      storage.actions.fetchPrimarySpokenLanguages();
      expect(store.dispatch).toBeCalledWith('registration/fetchPrimarySpokenLanguages');
    });

    it('should proxy fetchIndigenousCommunities', () => {
      storage.actions.fetchIndigenousCommunities();
      expect(store.dispatch).toBeCalledWith('registration/fetchIndigenousCommunities');
    });

    it('should proxy submitRegistration', () => {
      storage.actions.submitRegistration('recaptchaToken');
      expect(store.dispatch).toBeCalledWith('registration/submitRegistration', 'recaptchaToken');
    });

    it('should proxy updatePersonContactInformation', () => {
      const member = mockMember();
      const isPrimaryMember = true;
      storage.actions.updatePersonContactInformation({ member, isPrimaryMember });
      expect(store.dispatch).toBeCalledWith('registration/updatePersonContactInformation', { member, isPrimaryMember, index: -1 });
    });

    it('should proxy updatePersonIdentity', () => {
      const member = mockMember();
      const isPrimaryMember = true;
      storage.actions.updatePersonIdentity({ member, isPrimaryMember });
      expect(store.dispatch).toBeCalledWith('registration/updatePersonIdentity', { member, isPrimaryMember, index: -1 });
    });

    it('should proxy updatePersonAddress', () => {
      const member = mockMember();
      const isPrimaryMember = true;
      storage.actions.updatePersonAddress({ member, isPrimaryMember });
      expect(store.dispatch).toBeCalledWith('registration/updatePersonAddress', {
        member, isPrimaryMember, index: -1, sameAddress: false,
      });
    });

    it('should proxy addAdditionalMember', () => {
      const householdId = '4113a553-13ed-41da-a692-f39c934bee05';
      const member = mockMember();
      const sameAddress = true;
      storage.actions.addAdditionalMember({ householdId, member, sameAddress });
      expect(store.dispatch).toBeCalledWith('registration/addAdditionalMember', {
        householdId, member, sameAddress,
      });
    });

    it('should proxy deleteAdditionalMember', () => {
      const householdId = '4113a553-13ed-41da-a692-f39c934bee05';
      const memberId = mockMember().id;
      const index = 0;
      storage.actions.deleteAdditionalMember({ householdId, memberId, index });
      expect(store.dispatch).toBeCalledWith('registration/deleteAdditionalMember', {
        householdId, memberId, index,
      });
    });

    it('should proxy splitHousehold', () => {
      storage.actions.splitHousehold();
      expect(store.dispatch).toBeCalledWith('registration/splitHousehold');
    });
  });
});
