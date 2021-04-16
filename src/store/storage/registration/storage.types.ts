import { IIndigenousIdentityData, EIndigenousTypes } from '@/entities/beneficiary';
import { IEvent } from '@/entities/event';
import { ILeftMenuItem } from '@/types/interfaces/ILeftMenuItem';
import { TranslateResult } from 'vue-i18n';

import { ECanadaProvinces, IOptionItemData } from '@/types';

export interface IStorage {
  getters: {
    event(): IEvent;
    isLeftMenuOpen(): boolean;
    tabs(): ILeftMenuItem[];
    currentTab(): ILeftMenuItem;
    currentTabIndex(): number;
    previousTabName(): string;
    nextTabName(): string;
    genders(): IOptionItemData[];
    preferredLanguages(): IOptionItemData[];
    primarySpokenLanguages(): IOptionItemData[];
    indigenousTypesItems(provinceCode: ECanadaProvinces): Record<string, TranslateResult>[];
    indigenousCommunitiesItems(provinceCode: ECanadaProvinces, indigenousType: EIndigenousTypes): Record<string, string>[];
  };

  mutations: {
    toggleLeftMenu(isLeftMenuOpen: boolean): void;
    setCurrentTabIndex(newIndex: number): void;
    mutateCurrentTab(callback: (currentTab: ILeftMenuItem) => void): void;
    jump(toIndex: number): void;
    setIsPrivacyAgreed(payload: boolean): void;
    setDateTimeConsent(payload: string): void;
  };

  actions: {
    fetchEvent(lang: string, registrationLink: string): Promise<IEvent>;
    fetchGenders(): Promise<IOptionItemData[]>;
    fetchPreferredLanguages(): Promise<IOptionItemData[]>;
    fetchPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
    fetchIndigenousIdentitiesByProvince(provinceCode: number): Promise<IIndigenousIdentityData[]>;
  };
}

export interface IStorageMock {
  getters: {
    event: jest.Mock<IEvent>;
    isLeftMenuOpen: jest.Mock<boolean>;
    tabs: jest.Mock<boolean>;
    currentTab: jest.Mock<boolean>;
    currentTabIndex: jest.Mock<number>;
    previousTabName: jest.Mock<string>;
    nextTabName: jest.Mock<string>;
    genders: jest.Mock<IOptionItemData[]>;
    preferredLanguages: jest.Mock<IOptionItemData[]>;
    primarySpokenLanguages: jest.Mock<IOptionItemData[]>;
    indigenousTypesItems: jest.Mock<Record<string, unknown>[]>;
    indigenousCommunitiesItems: jest.Mock<Record<string, string>[]>;
  };

  mutations: {
    toggleLeftMenu: jest.Mock<void>;
    setCurrentTabIndex: jest.Mock<void>;
    mutateCurrentTab: jest.Mock<void>;
    jump: jest.Mock<void>;
    setIsPrivacyAgreed: jest.Mock<void>;
    setDateTimeConsent: jest.Mock<void>;
  };

  actions: {
    fetchEvent: jest.Mock<void>;
    fetchGenders: jest.Mock<IOptionItemData[]>;
    fetchPreferredLanguages: jest.Mock<IOptionItemData[]>;
    fetchPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
    fetchIndigenousIdentitiesByProvince: jest.Mock<IIndigenousIdentityData[]>;
  };
}
