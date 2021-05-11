import { IStore, IState } from '@/store/store.types';
import { TranslateResult } from 'vue-i18n';
import {
  ECanadaProvinces, ERegistrationMethod, IOptionItemData, IRegistrationMenuItem,
} from '../../../types';
import { IError } from '../../../services/httpClient';
import {
  IIndigenousIdentityData, EIndigenousTypes, ICreateBeneficiaryResponse,
} from '../../../entities/beneficiary';
import { IEvent, IEventData } from '../../../entities/event';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({

  getters: {

    event(): IEvent {
      return store.getters['registration/event'];
    },

    isLeftMenuOpen(): boolean {
      return store.getters['registration/isLeftMenuOpen'];
    },

    tabs(): IRegistrationMenuItem[] {
      return store.getters['registration/tabs'];
    },

    currentTab(): IRegistrationMenuItem {
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

    indigenousTypesItems(provinceCode: ECanadaProvinces): Record<string, TranslateResult>[] {
      return store.getters['registration/indigenousTypesItems'](provinceCode);
    },

    indigenousCommunitiesItems(provinceCode: ECanadaProvinces, indigenousType: EIndigenousTypes): Record<string, string>[] {
      return store.getters['registration/indigenousCommunitiesItems'](provinceCode, indigenousType);
    },

    findEffectiveJumpIndex(targetIndex: number): number {
      return store.getters['registration/findEffectiveJumpIndex'](targetIndex);
    },

    registrationResponse(): ICreateBeneficiaryResponse {
      return store.getters['registration/registrationResponse'];
    },

    registrationErrors(): IError[] {
      return store.getters['registration/registrationErrors'];
    },
  },

  mutations: {
    toggleLeftMenu(isLeftMenuOpen: boolean) {
      store.commit('registration/toggleLeftMenu', isLeftMenuOpen);
    },

    setCurrentTabIndex(newIndex: number) {
      store.commit('registration/setCurrentTabIndex', newIndex);
    },

    mutateCurrentTab(callback: (currentTab: IRegistrationMenuItem) => void) {
      store.commit('registration/mutateCurrentTab', callback);
    },

    mutateTabAtIndex(targetIndex: number, callback: (currentTab: IRegistrationMenuItem) => void) {
      store.commit('registration/mutateTabAtIndex', { targetIndex, callback });
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

    setEvent(payload: IEventData): void {
      store.commit('registration/setEvent', payload);
    },

    setPrivacyCRCUsername(payload: string): void {
      store.commit('registration/setPrivacyCRCUsername', payload);
    },

    setPrivacyRegistrationMethod(payload: ERegistrationMethod): void {
      store.commit('registration/setPrivacyRegistrationMethod', payload);
    },

    setPrivacyRegistrationLocationName(payload: string): void {
      store.commit('registration/setPrivacyRegistrationLocationName', payload);
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

    submitRegistration(): Promise<ICreateBeneficiaryResponse> {
      return store.dispatch('registration/submitRegistration');
    },
  },
});
