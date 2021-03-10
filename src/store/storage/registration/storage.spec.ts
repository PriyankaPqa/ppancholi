import { mockStore } from '@/store';
import { ILeftMenuItem } from '@/types';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Registration Storage', () => {
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

    it('should proxy current indigenousTypes', () => {
      expect(storage.getters.indigenousTypes()).toEqual(store.getters['registration/indigenousTypes']);
    });

    it('should proxy current indigenousCommunities', () => {
      expect(storage.getters.indigenousCommunities()).toEqual(store.getters['registration/indigenousCommunities']);
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
      const payload = (tab: ILeftMenuItem) => {
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
  });

  describe('>> Actions', () => {
    it('should proxy fetchEvent', () => {
      const lang = 'en';
      const registrationLink = 'test link';
      storage.actions.fetchEvent(lang, registrationLink);
      expect(store.dispatch).toBeCalledWith('registration/fetchEvent', { lang, registrationLink });
    });

    it('should proxy fetGenders', () => {
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

    it('should proxy fetchIndigenousTypes', () => {
      storage.actions.fetchIndigenousTypes();
      expect(store.dispatch).toBeCalledWith('registration/fetchIndigenousTypes');
    });

    it('should proxy fetchIndigenousCommunities', () => {
      storage.actions.fetchIndigenousCommunities();
      expect(store.dispatch).toBeCalledWith('registration/fetchIndigenousCommunities');
    });
  });
});
