import {
  IOptionItemData, IIndigenousCommunityData,
} from '@/entities/beneficiary';
import { IEvent } from '@/entities/event';
import { ILeftMenuItem } from '@/types/interfaces/ILeftMenuItem';

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
    indigenousTypes(): IOptionItemData[];
    indigenousCommunities(): IIndigenousCommunityData[];
  };

  mutations: {
    toggleLeftMenu(isLeftMenuOpen: boolean): void;
    setCurrentTabIndex(newIndex: number): void;
    mutateCurrentTab(callback: (currentTab: ILeftMenuItem) => void): void;
    jump(toIndex: number): void;
  };

  actions: {
    fetchEvent(lang: string, registrationLink: string): Promise<IEvent>;
    fetchGenders(): Promise<IOptionItemData[]>;
    fetchPreferredLanguages(): Promise<IOptionItemData[]>;
    fetchPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
    fetchIndigenousTypes(): Promise<IOptionItemData[]>;
    fetchIndigenousCommunities(): Promise<IIndigenousCommunityData[]>;
  };
}

export interface IStorageMock {
  getters: {
    event: jest.Mock<IEvent>;
    isLeftMenuOpen: jest.Mock<boolean>;
    tabs: jest.Mock<boolean>;
    currentTab: jest.Mock<boolean>;
    currentTabIndex: jest.Mock<boolean>;
    previousTabName: jest.Mock<string>;
    nextTabName: jest.Mock<string>;
    genders: jest.Mock<IOptionItemData[]>;
    preferredLanguages: jest.Mock<IOptionItemData[]>;
    primarySpokenLanguages: jest.Mock<IOptionItemData[]>;
    indigenousTypes: jest.Mock<IOptionItemData[]>;
    indigenousCommunities: jest.Mock<IIndigenousCommunityData[]>;
  };

  mutations: {
    toggleLeftMenu: jest.Mock<void>;
    setCurrentTabIndex: jest.Mock<void>;
    mutateCurrentTab: jest.Mock<void>;
    jump: jest.Mock<void>;
  };

  actions: {
    fetchEvent: jest.Mock<void>;
    fetchGenders: jest.Mock<IOptionItemData[]>;
    fetchPreferredLanguages: jest.Mock<IOptionItemData[]>;
    fetchPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
    fetchIndigenousTypes: jest.Mock<IOptionItemData[]>;
    fetchIndigenousCommunities: jest.Mock<IIndigenousCommunityData[]>;
  };
}
