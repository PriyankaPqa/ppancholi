import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import { mockHouseholdEntity } from '../../../entities/household';
import {
  mockContactInformation,
  mockGenders, mockHouseholdCreate,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems, mockMember,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '../../../entities/household-create';

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
    registrationResponse: jest.fn(() => mockHouseholdEntity()),
    registrationErrors: jest.fn(() => []),
    householdCreate: jest.fn(() => _cloneDeep(mockHouseholdCreate())),
    personalInformation: jest.fn(() => _merge(mockContactInformation(), mockMember())),
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
    setPrivacyCRCUsername: jest.fn(),
    setPrivacyRegistrationMethod: jest.fn(),
    setPrivacyRegistrationLocationId: jest.fn(),
    resetState: jest.fn(),
    decreaseInlineEditCounter: jest.fn(),
    increaseInlineEditCounter: jest.fn(),
    setHouseholdResultsShown: jest.fn(),
    setPersonalInformation: jest.fn(),
    setPrimaryBeneficiary: jest.fn(),
    setIdentity: jest.fn(),
    setIndigenousIdentity: jest.fn(),
    setContactInformation: jest.fn(),
    setHomeAddress: jest.fn(),
    setCurrentAddress: jest.fn(),
    setNoFixedHome: jest.fn(),
    resetCurrentAddress: jest.fn(),
    addAdditionalMember: jest.fn(),
    removeAdditionalMember: jest.fn(),
    editAdditionalMember: jest.fn(),
    resetHouseholdCreate: jest.fn(),
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
