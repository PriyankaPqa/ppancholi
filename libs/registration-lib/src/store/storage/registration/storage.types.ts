import {
  IServerError,
  ERegistrationMethod, IOptionItemData,
} from '@libs/shared-lib/types';
import { TranslateResult } from 'vue-i18n';

import { IEvent, IEventData } from '@libs/entities-lib/registration-event';
import {
  IIndigenousCommunityData,
  EIndigenousTypes,
  IContactInformation,
  IMember,
  IIdentitySet,
  IAddress,
  ICurrentAddress,
  HouseholdCreate, IHouseholdCreate, IHouseholdCreateData,
} from '@libs/entities-lib/household-create';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { IRegistrationMenuItem } from '../../../types';

export interface IStorage {
  getters: {
    isCRCRegistration(): boolean;
    event(): IEvent;
    isLeftMenuOpen(): boolean;
    tabs(): IRegistrationMenuItem[];
    currentTab(): IRegistrationMenuItem;
    currentTabIndex(): number;
    previousTabName(): string;
    nextTabName(): string;
    genders(includeInactive?: boolean): IOptionItemData[];
    preferredLanguages(): IOptionItemData[];
    primarySpokenLanguages(includeInactive?: boolean): IOptionItemData[];
    findEffectiveJumpIndex(targetIndex: number): number;
    indigenousTypesItems(): Record<string, TranslateResult>[];
    indigenousCommunitiesItems(indigenousType: EIndigenousTypes): Record<string, string>[];
    registrationResponse(): IHouseholdEntity;
    registrationErrors(): IServerError;
    householdCreate(): HouseholdCreate;
    personalInformation(): IContactInformation & IIdentitySet;
    isSplitMode(): boolean;
  };

  mutations: {
    toggleLeftMenu(isLeftMenuOpen: boolean): void;
    setCurrentTabIndex(newIndex: number): void;
    mutateCurrentTab(callback: (currentTab: IRegistrationMenuItem) => void): void;
    mutateTabAtIndex(targetIndex: number, callback: (currentTab: IRegistrationMenuItem) => void): void;
    jump(toIndex: number): void;
    setIsPrivacyAgreed(payload: boolean): void;
    setDateTimeConsent(payload: string): void;
    setEvent(payload: IEventData): void;
    setPrivacyCRCUsername(payload: string): void;
    setPrivacyRegistrationMethod(payload: ERegistrationMethod): void;
    setPrivacyRegistrationLocationId(payload: string): void;
    resetState(tabs: IRegistrationMenuItem[]): void;
    decreaseInlineEditCounter(): void;
    increaseInlineEditCounter(): void;
    setHouseholdResultsShown(payload: boolean): void;
    setPersonalInformation(payload: IContactInformation & IIdentitySet): void;
    setPrimaryBeneficiary(payload: IMember): void;
    setIdentity(payload: IIdentitySet): void;
    setIndigenousIdentity(payload: IIdentitySet): void;
    setContactInformation(payload: IContactInformation): void;
    setHomeAddress(payload: IAddress): void;
    setCurrentAddress(payload: ICurrentAddress): void;
    setNoFixedHome(payload: boolean): void;
    addAdditionalMember(payload: IMember, sameAddress: boolean): void;
    removeAdditionalMember(index: number): void;
    editAdditionalMember(payload: IMember, index: number, sameAddress: boolean): void;
    resetHouseholdCreate(): void;
    setHouseholdAssociationMode(payload: boolean): void;
    setHouseholdAlreadyRegistered(payload: boolean): void;
    setHouseholdCreate(payload: IHouseholdCreateData): void;
    setRegistrationErrors(payload: IServerError): void;
    setSplitHousehold({ originHouseholdId, primaryMember, additionalMembers }: { originHouseholdId: string; primaryMember: IMember; additionalMembers: IMember[] }): void;
    resetSplitHousehold(): void;
    setTabs(tabs: IRegistrationMenuItem[]): void;
    setPrimarySpokenLanguagesFetched(payload: boolean): void;
    setGendersFetched(payload: boolean): void;
    setRegistrationResponse(payload: unknown): void;
    setInformationFromBeneficiarySearch(payload: unknown): void;
  };

  actions: {
    fetchEvent(lang: string, registrationLink: string): Promise<IEvent>;
    fetchGenders(): Promise<IOptionItemData[]>;
    fetchPreferredLanguages(): Promise<(IOptionItemData & { languageCode: string })[]>;
    fetchPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
    fetchIndigenousCommunities(): Promise<IIndigenousCommunityData[]>;
    submitRegistration(recaptchaToken?: string): Promise<IHouseholdEntity>;
    updatePersonContactInformation({ member, isPrimaryMember, index }: { member: IMember; isPrimaryMember: boolean; index?: number }): Promise<IHouseholdEntity>;
    updatePersonIdentity({ member, isPrimaryMember, index }: { member: IMember; isPrimaryMember: boolean; index?: number }): Promise<IHouseholdEntity>;
    updatePersonAddress({
      member, isPrimaryMember, index, sameAddress,
    }: { member: IMember; isPrimaryMember: boolean; index?: number; sameAddress?: boolean }): Promise<IHouseholdEntity>;
    addAdditionalMember({ householdId, member, sameAddress }: { householdId: string; member: IMember; sameAddress?: boolean }): Promise<IHouseholdEntity>;
    splitHousehold(): Promise<IHouseholdEntity>;
    deleteAdditionalMember({ householdId, memberId, index }: { householdId: string; memberId: string; index: number }): Promise<IHouseholdEntity>;
  };
}

export interface IStorageMock {
  getters: {
    isCRCRegistration: jest.Mock<boolean>;
    event: jest.Mock<IEvent>;
    isLeftMenuOpen: jest.Mock<boolean>;
    tabs: jest.Mock<IRegistrationMenuItem[]>;
    currentTab: jest.Mock<IRegistrationMenuItem>;
    currentTabIndex: jest.Mock<number>;
    previousTabName: jest.Mock<string>;
    nextTabName: jest.Mock<string>;
    genders: jest.Mock<IOptionItemData[]>;
    preferredLanguages: jest.Mock<IOptionItemData[]>;
    primarySpokenLanguages: jest.Mock<IOptionItemData[]>;
    indigenousTypesItems: jest.Mock<Record<string, unknown>[]>;
    indigenousCommunitiesItems: jest.Mock<Record<string, string>[]>;
    findEffectiveJumpIndex: jest.Mock<number>;
    registrationResponse: jest.Mock<IHouseholdEntity>;
    registrationErrors: jest.Mock<IServerError>;
    householdCreate: jest.Mock<IHouseholdCreate>;
    personalInformation: jest.Mock<IContactInformation & IIdentitySet>;
    isSplitMode: jest.Mock<boolean>;
  };

  mutations: {
    toggleLeftMenu: jest.Mock<void>;
    setCurrentTabIndex: jest.Mock<void>;
    mutateCurrentTab: jest.Mock<void>;
    mutateTabAtIndex: jest.Mock<void>;
    jump: jest.Mock<void>;
    setIsPrivacyAgreed: jest.Mock<void>;
    setDateTimeConsent: jest.Mock<void>;
    setEvent: jest.Mock<void>;
    setPrivacyCRCUsername: jest.Mock<void>;
    setPrivacyRegistrationMethod: jest.Mock<void>;
    setPrivacyRegistrationLocationId: jest.Mock<void>;
    resetState: jest.Mock<void>;
    decreaseInlineEditCounter: jest.Mock<void>;
    increaseInlineEditCounter: jest.Mock<void>;
    setHouseholdResultsShown: jest.Mock<void>;
    setPersonalInformation: jest.Mock<void>;
    setPrimaryBeneficiary: jest.Mock<void>;
    setIdentity: jest.Mock<void>;
    setIndigenousIdentity: jest.Mock<void>;
    setContactInformation: jest.Mock<void>;
    setHomeAddress: jest.Mock<void>;
    setCurrentAddress: jest.Mock<void>;
    setNoFixedHome: jest.Mock<void>;
    resetCurrentAddress: jest.Mock<void>;
    addAdditionalMember: jest.Mock<void>;
    removeAdditionalMember: jest.Mock<void>;
    editAdditionalMember: jest.Mock<void>;
    resetHouseholdCreate: jest.Mock<void>;
    setHouseholdAssociationMode: jest.Mock<void>;
    setHouseholdAlreadyRegistered: jest.Mock<void>;
    setHouseholdCreate: jest.Mock<void>;
    setRegistrationErrors: jest.Mock<void>;
    setSplitHousehold: jest.Mock<void>;
    resetSplitHousehold: jest.Mock<void>;
    setTabs: jest.Mock<void>;
    setPrimarySpokenLanguagesFetched: jest.Mock<void>;
    setGendersFetched: jest.Mock<void>;
    setRegistrationResponse: jest.Mock<void>;
  };

  actions: {
    fetchEvent: jest.Mock<void>;
    fetchGenders: jest.Mock<IOptionItemData[]>;
    fetchPreferredLanguages: jest.Mock<IOptionItemData[]>;
    fetchPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
    fetchIndigenousCommunities: jest.Mock<IIndigenousCommunityData[]>;
    submitRegistration: jest.Mock<IHouseholdEntity>;
    updatePersonIdentity: jest.Mock<IHouseholdEntity>;
    updatePersonContactInformation: jest.Mock<IHouseholdEntity>;
    updatePersonAddress: jest.Mock<IHouseholdEntity>;
    addAdditionalMember: jest.Mock<IHouseholdEntity>;
    splitHousehold: jest.Mock<IHouseholdEntity>;
    deleteAdditionalMember: jest.Mock<IHouseholdEntity>;
  };
}
