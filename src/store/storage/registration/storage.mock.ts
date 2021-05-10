import {
  mockCreateBeneficiaryResponse,
  mockGenders,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '../../../entities/beneficiary';

import { mockEvent } from '../../../entities/event';
import { IStorageMock } from './storage.types';

export const mockStorageRegistration = (): IStorageMock => ({
  getters: {
    event: jest.fn(() => mockEvent()),
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
    registrationResponse: jest.fn(() => mockCreateBeneficiaryResponse()),
  },

  mutations: {
    toggleLeftMenu: jest.fn(),
    setCurrentTabIndex: jest.fn(),
    mutateCurrentTab: jest.fn(),
    mutateTabAtIndex: jest.fn(),
    jump: jest.fn(),
    setIsPrivacyAgreed: jest.fn(),
    setDateTimeConsent: jest.fn(),
    setEvent: jest.fn(),
  },

  actions: {
    fetchEvent: jest.fn(),
    fetchGenders: jest.fn(),
    fetchPreferredLanguages: jest.fn(),
    fetchPrimarySpokenLanguages: jest.fn(),
    fetchIndigenousIdentitiesByProvince: jest.fn(),
    submitRegistration: jest.fn(),
  },
});
