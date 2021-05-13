import { mockStore } from '@/store';
import { mockTabs } from '@/store/modules/registration/tabs.mock';
import { ECanadaProvinces, ERegistrationMethod, IRegistrationMenuItem } from '../../../types';
import { mockEventData } from '../../../entities/event';
import { makeStorage } from './storage';

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
