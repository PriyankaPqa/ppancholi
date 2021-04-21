import {
  mockGenders,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '../../../entities/beneficiary';
import { IStorageMock } from './storage.types';

export const mockStorageRegistration = (): IStorageMock => ({
  getters: {
    event: jest.fn(),
    isLeftMenuOpen: jest.fn(),
    tabs: jest.fn(),
    currentTab: jest.fn(),
    currentTabIndex: jest.fn(),
    previousTabName: jest.fn(),
    nextTabName: jest.fn(),
    genders: jest.fn(() => mockGenders()),
    preferredLanguages: jest.fn(() => mockPreferredLanguages()),
    primarySpokenLanguages: jest.fn(() => mockPrimarySpokenLanguages()),
    indigenousTypesItems: jest.fn(() => mockIndigenousTypesItems()),
    indigenousCommunitiesItems: jest.fn(() => mockIndigenousCommunitiesItems()),
    findEffectiveJumpIndex: jest.fn(),
  },

  mutations: {
    toggleLeftMenu: jest.fn(),
    setCurrentTabIndex: jest.fn(),
    mutateCurrentTab: jest.fn(),
    mutateTabAtIndex: jest.fn(),
    jump: jest.fn(),
    setIsPrivacyAgreed: jest.fn(),
    setDateTimeConsent: jest.fn(),
  },

  actions: {
    fetchEvent: jest.fn(),
    fetchGenders: jest.fn(),
    fetchPreferredLanguages: jest.fn(),
    fetchPrimarySpokenLanguages: jest.fn(),
    fetchIndigenousIdentitiesByProvince: jest.fn(),
  },
});
