import { IStore, IState } from '@/store/store.types';
import { TranslateResult } from 'vue-i18n';
import { IHouseholdEntity } from '../../../entities/household';
import {
  ERegistrationMethod, IOptionItemData, IRegistrationMenuItem,
} from '../../../types';
import { IError } from '../../../services/httpClient';
import {
  IIndigenousIdentityData, EIndigenousTypes, IContactInformation, IMember, IIdentitySetData, IAddress, ICurrentAddress, IHouseholdCreateData,
} from '../../../entities/household-create';
import { IEvent, IEventData } from '../../../entities/event';
import { IStorage } from './storage.types';

// eslint-disable-next-line
export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    isCRCRegistration(): boolean {
      return store.getters['registration/isCRCRegistration'];
    },

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

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return store.getters['registration/indigenousTypesItems'];
    },

    indigenousCommunitiesItems(indigenousType: EIndigenousTypes): Record<string, string>[] {
      return store.getters['registration/indigenousCommunitiesItems'](indigenousType);
    },

    findEffectiveJumpIndex(targetIndex: number): number {
      return store.getters['registration/findEffectiveJumpIndex'](targetIndex);
    },

    registrationResponse(): IHouseholdEntity {
      return store.getters['registration/registrationResponse'];
    },

    registrationErrors(): IError[] {
      return store.getters['registration/registrationErrors'];
    },

    householdCreate() {
      return store.getters['registration/householdCreate'];
    },

    personalInformation() {
      return store.getters['registration/personalInformation'];
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

    setPrivacyRegistrationLocationId(payload: string): void {
      store.commit('registration/setPrivacyRegistrationLocationId', payload);
    },

    resetState(tabs: IRegistrationMenuItem[]): void {
      store.commit('registration/resetState', tabs);
    },

    increaseInlineEditCounter(): void {
      store.commit('registration/increaseInlineEditCounter');
    },

    decreaseInlineEditCounter(): void {
      store.commit('registration/decreaseInlineEditCounter');
    },

    setHouseholdResultsShown(payload: boolean): void {
      store.commit('registration/setHouseholdResultsShown', payload);
    },

    setPersonalInformation(payload: IContactInformation & IMember) {
      store.commit('registration/setPersonalInformation', payload);
    },

    setPrimaryBeneficiary(payload: IMember) {
      store.commit('registration/setPrimaryBeneficiary', payload);
    },

    setIdentity(payload: IIdentitySetData) {
      store.commit('registration/setIdentity', payload);
    },

    setIndigenousIdentity(payload: IIdentitySetData) {
      store.commit('registration/setIndigenousIdentity', payload);
    },

    setContactInformation(payload: IContactInformation) {
      store.commit('registration/setContactInformation', payload);
    },

    setHomeAddress(payload: IAddress) {
      store.commit('registration/setHomeAddress', payload);
    },

    setCurrentAddress(payload: ICurrentAddress) {
      store.commit('registration/setCurrentAddress', payload);
    },

    setNoFixedHome(payload: boolean) {
      store.commit('registration/setNoFixedHome', payload);
    },

    addAdditionalMember(payload: IMember, sameAddress: boolean) {
      store.commit('registration/addAdditionalMember', { payload, sameAddress });
    },

    removeAdditionalMember(index: number) {
      store.commit('registration/removeAdditionalMember', index);
    },

    editAdditionalMember(payload: IMember, index: number, sameAddress: boolean) {
      store.commit('registration/editAdditionalMember', { payload, index, sameAddress });
    },

    resetHouseholdCreate() {
      store.commit('registration/resetHouseholdCreate');
    },

    setHouseholdAssociationMode(payload: boolean) {
      store.commit('registration/setHouseholdAssociationMode', payload);
    },

    setHouseholdAlreadyRegistered(payload: boolean) {
      store.commit('registration/setHouseholdAlreadyRegistered', payload);
    },

    setHouseholdCreate(payload: IHouseholdCreateData) {
      store.commit('registration/setHouseholdCreate', payload);
    },

    setRegistrationErrors(payload: IError[]) {
      store.commit('registration/setRegistrationErrors', payload);
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

    fetchIndigenousIdentities(): Promise<IIndigenousIdentityData[]> {
      return store.dispatch('registration/fetchIndigenousIdentities');
    },

    submitRegistration(): Promise<IHouseholdEntity> {
      return store.dispatch('registration/submitRegistration');
    },
  },
});
