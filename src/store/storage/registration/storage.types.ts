import { TranslateResult } from 'vue-i18n';
import {
  ERegistrationMethod, IOptionItemData, IRegistrationMenuItem,
} from '../../../types';
import { IError } from '../../../services/httpClient';

import { IEvent, IEventData } from '../../../entities/event';
import {
  IIndigenousCommunityData,
  EIndigenousTypes,
  IContactInformation,
  IMember,
  IIdentitySet,
  IAddress,
  ICurrentAddress,
  HouseholdCreate, IHouseholdCreate, IHouseholdCreateData,
} from '../../../entities/household-create';
import { IHouseholdEntity } from '../../../entities/household';

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
    genders(): IOptionItemData[];
    preferredLanguages(): IOptionItemData[];
    primarySpokenLanguages(): IOptionItemData[];
    findEffectiveJumpIndex(targetIndex: number): number;
    indigenousTypesItems(): Record<string, TranslateResult>[];
    indigenousCommunitiesItems(indigenousType: EIndigenousTypes): Record<string, string>[];
    registrationResponse(): IHouseholdEntity;
    registrationErrors(): IError[];
    householdCreate(): HouseholdCreate;
    personalInformation(): IContactInformation & IMember;
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
    setPersonalInformation(payload: IContactInformation & IMember): void;
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
    setRegistrationErrors(payload: IError[]): void;
  };

  actions: {
    fetchEvent(lang: string, registrationLink: string): Promise<IEvent>;
    fetchGenders(): Promise<IOptionItemData[]>;
    fetchPreferredLanguages(): Promise<IOptionItemData[]>;
    fetchPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
    fetchIndigenousCommunities(): Promise<IIndigenousCommunityData[]>;
    submitRegistration(): Promise<IHouseholdEntity>;
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
    registrationErrors: jest.Mock<IError[]>;
    householdCreate: jest.Mock<IHouseholdCreate>;
    personalInformation: jest.Mock<IContactInformation & IMember>;
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
  };

  actions: {
    fetchEvent: jest.Mock<void>;
    fetchGenders: jest.Mock<IOptionItemData[]>;
    fetchPreferredLanguages: jest.Mock<IOptionItemData[]>;
    fetchPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
    fetchIndigenousCommunities: jest.Mock<IIndigenousCommunityData[]>;
    submitRegistration: jest.Mock<IHouseholdEntity>;
  };
}
