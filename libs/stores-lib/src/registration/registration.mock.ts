import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { ERegistrationMode } from '@libs/shared-lib/types';
import { mockHouseholdsService } from '@libs/services-lib/households/entity';
import { mockPublicService } from '@libs/services-lib/public';
import {
  HouseholdCreate,
  mockGenders,
  mockHouseholdCreate, mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems, mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '@libs/entities-lib/household-create';
import { TranslateResult } from 'vue-i18n';
import { mockEventSummary, mockRegistrationAssessment } from '@libs/entities-lib/event';
import { mockCaseFilesService } from '@libs/services-lib/case-files/entity';
import { RegistrationEvent } from '@libs/entities-lib/registration-event';
import { mockTabs } from './tabs.mock';
import { storeFactory } from './registration';

export const useMockRegistrationStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const registrationStore = storeFactory({
    pTabs: mockTabs(),
    i18n: {
      t: (t: string) => t,
    } as any,
    skipAgeRestriction: false,
    skipEmailPhoneRules: false,
    mode: ERegistrationMode.Self,
    householdApi: mockHouseholdsService(),
    publicApi: mockPublicService(),
    caseFileApi: mockCaseFilesService(),
  });

  registrationStore.getHouseholdCreate = jest.fn(() => new HouseholdCreate(mockHouseholdCreate()));
  registrationStore.householdCreate = new HouseholdCreate(mockHouseholdCreate());
  registrationStore.getPreferredLanguages = jest.fn(() => mockPreferredLanguages());
  registrationStore.getPrimarySpokenLanguages = jest.fn(() => mockPrimarySpokenLanguages());
  registrationStore.getGenders = jest.fn(() => mockGenders());
  registrationStore.getEvent = jest.fn(() => new RegistrationEvent(mockEventSummary()));
  registrationStore.event = mockEventSummary();
  registrationStore.getIndigenousTypesItems = jest.fn(() => mockIndigenousTypesItems() as Record<string, TranslateResult>[]);
  registrationStore.getIndigenousCommunitiesItems = jest.fn(() => mockIndigenousCommunitiesItems() as Record<string, string>[]);
  registrationStore.tabs = mockTabs();
  registrationStore.householdCreate.primaryBeneficiary.identitySet.setIndigenousIdentity = jest.fn();
  registrationStore.householdCreate.primaryBeneficiary.setIdentity = jest.fn();
  registrationStore.householdCreate.primaryBeneficiary.setContactInformation = jest.fn();
  registrationStore.householdCreate.setCurrentAddress = jest.fn();
  registrationStore.householdCreate.setHomeAddress = jest.fn();
  registrationStore.getAssessmentToComplete = jest.fn(() => ({
    registrationAssessment: mockRegistrationAssessment(),
    assessmentForm: null,
  }));

  return {
    pinia: p,
    registrationStore,
  };
};
