import { mockStore } from '@/store';
import { mockTabs } from '@/store/modules/registration/tabs.mock';
import _merge from 'lodash/merge';
import { mockContactInformation } from '@/entities/value-objects/contact-information';
import { mockAdditionalMember, mockMember } from '@/entities/value-objects/member';
import { mockIdentitySet } from '@/entities/value-objects/identity-set';
import { mockAddress } from '@/entities/value-objects/address';
import { mockCampGround } from '@/entities/value-objects/current-address';
import { makeStorage } from './storage';
import { mockEventData } from '../../../entities/event';
import { ECanadaProvinces, ERegistrationMethod, IRegistrationMenuItem } from '../../../types';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Registration Storage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('>> Getters', () => {
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
      expect(storage.getters.genders()).toEqual(store.getters['registration/genders']);
    });

    it('should proxy current preferredLanguages', () => {
      expect(storage.getters.preferredLanguages()).toEqual(store.getters['registration/preferredLanguages']);
    });

    it('should proxy current primarySpokenLanguages', () => {
      expect(storage.getters.primarySpokenLanguages()).toEqual(store.getters['registration/primarySpokenLanguages']);
    });

    it('should proxy current indigenousTypesItems', () => {
      expect(storage.getters.indigenousTypesItems(ECanadaProvinces.AB))
        .toEqual(store.getters['registration/indigenousTypesItems'](ECanadaProvinces.AB));
    });

    it('should proxy current indigenousCommunitiesItems', () => {
      expect(storage.getters.indigenousCommunitiesItems(ECanadaProvinces.AB, 1))
        .toEqual(store.getters['registration/indigenousCommunitiesItems'](ECanadaProvinces.AB, 1));
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

    it('should proxy setPrivacyRegistrationLocationName', () => {
      const payload = 'name';
      storage.mutations.setPrivacyRegistrationLocationName(payload);
      expect(store.commit).toBeCalledWith('registration/setPrivacyRegistrationLocationName', payload);
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
      const payload = _merge(mockContactInformation(), mockMember());
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

    it('should proxy fetchIndigenousIdentitiesByProvince', () => {
      const provinceCode = ECanadaProvinces.AB;
      storage.actions.fetchIndigenousIdentitiesByProvince(provinceCode);
      expect(store.dispatch).toBeCalledWith('registration/fetchIndigenousIdentitiesByProvince', provinceCode);
    });

    it('should proxy submitRegistration', () => {
      storage.actions.submitRegistration();
      expect(store.dispatch).toBeCalledWith('registration/submitRegistration');
    });
  });
});
