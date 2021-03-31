import { ILeftMenuItem } from '@/types/interfaces/ILeftMenuItem';
import { IEvent } from '@/entities/event';
import { IStore } from '@/store/store.types';
import { IOptionItemData, IIndigenousIdentityData, EIndigenousTypes } from '@/entities/beneficiary';
import { TranslateResult } from 'vue-i18n';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({

  getters: {

    event(): IEvent {
      return store.getters['registration/event'];
    },

    isLeftMenuOpen(): boolean {
      return store.getters['registration/isLeftMenuOpen'];
    },

    tabs(): ILeftMenuItem[] {
      return store.getters['registration/tabs'];
    },

    currentTab(): ILeftMenuItem {
      return store.getters['registration/currentTab'];
    },

    currentTabIndex(): number {
      return store.getters['registration/currentTabIndex'];
    },

    previousTabName(): string {
      return store.getters['registration/previousTabName'];
    },

    nextTabName(): string {
      return store.getters['registration/nextTabName'];
    },

    genders(): IOptionItemData[] {
      return store.getters['registration/genders'];
    },

    preferredLanguages(): IOptionItemData[] {
      return store.getters['registration/preferredLanguages'];
    },

    primarySpokenLanguages(): IOptionItemData[] {
      return store.getters['registration/primarySpokenLanguages'];
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return store.getters['registration/indigenousTypesItems'];
    },

    indigenousCommunitiesItems(indigenousType: EIndigenousTypes): Record<string, string>[] {
      return store.getters['registration/indigenousCommunitiesItems'](indigenousType);
    },
  },

  mutations: {
    toggleLeftMenu(isLeftMenuOpen: boolean) {
      store.commit('registration/toggleLeftMenu', isLeftMenuOpen);
    },

    setCurrentTabIndex(newIndex: number) {
      store.commit('registration/setCurrentTabIndex', newIndex);
    },

    mutateCurrentTab(callback: (currentTab: ILeftMenuItem) => void) {
      store.commit('registration/mutateCurrentTab', callback);
    },

    jump(toIndex: number): void {
      store.commit('registration/jump', toIndex);
    },

    setIsPrivacyAgreed(payload: boolean): void {
      store.commit('registration/setIsPrivacyAgreed', payload);
    },

    setDateTimeConsent(payload: string): void {
      store.commit('registration/setDateTimeConsent', payload);
    },
  },

  actions: {
    fetchEvent(lang: string, registrationLink: string): Promise<IEvent> {
      return store.dispatch('registration/fetchEvent', { lang, registrationLink });
    },

    fetchGenders(): Promise<IOptionItemData[]> {
      return store.dispatch('registration/fetchGenders');
    },

    fetchPreferredLanguages(): Promise<IOptionItemData[]> {
      return store.dispatch('registration/fetchPreferredLanguages');
    },

    fetchPrimarySpokenLanguages(): Promise<IOptionItemData[]> {
      return store.dispatch('registration/fetchPrimarySpokenLanguages');
    },

    fetchIndigenousIdentitiesByProvince(provinceCode: number): Promise<IIndigenousIdentityData[]> {
      return store.dispatch('registration/fetchIndigenousIdentitiesByProvince', provinceCode);
    },
  },
});
