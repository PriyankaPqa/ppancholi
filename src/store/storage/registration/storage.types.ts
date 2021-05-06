import { TranslateResult } from 'vue-i18n';
import { ECanadaProvinces, IOptionItemData, IRegistrationMenuItem } from '../../../types';
import { IEvent, IEventData } from '../../../entities/event';
import { IIndigenousIdentityData, EIndigenousTypes, IBeneficiaryData } from '../../../entities/beneficiary';

export interface IStorage {
  getters: {
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
    indigenousTypesItems(provinceCode: ECanadaProvinces): Record<string, TranslateResult>[];
    indigenousCommunitiesItems(provinceCode: ECanadaProvinces, indigenousType: EIndigenousTypes): Record<string, string>[];
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
  };

  actions: {
    fetchEvent(lang: string, registrationLink: string): Promise<IEvent>;
    fetchGenders(): Promise<IOptionItemData[]>;
    fetchPreferredLanguages(): Promise<IOptionItemData[]>;
    fetchPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
    fetchIndigenousIdentitiesByProvince(provinceCode: number): Promise<IIndigenousIdentityData[]>;
    submitRegistration(): Promise<IBeneficiaryData>;
  };
}

export interface IStorageMock {
  getters: {
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
  };

  actions: {
    fetchEvent: jest.Mock<void>;
    fetchGenders: jest.Mock<IOptionItemData[]>;
    fetchPreferredLanguages: jest.Mock<IOptionItemData[]>;
    fetchPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
    fetchIndigenousIdentitiesByProvince: jest.Mock<IIndigenousIdentityData[]>;
    submitRegistration: jest.Mock<IBeneficiaryData>;
  };
}
