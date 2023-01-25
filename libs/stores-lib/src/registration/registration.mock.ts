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
import { mockEvent } from '@libs/entities-lib/registration-event';
import { mockRegistrationAssessment } from '@libs/entities-lib/event';
import { mockTabs } from './tabs.mock';
import { storeFactory } from './registration';

export const useMockRegistrationStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const registrationStore = storeFactory({
    pTabs: [
      {
        id: 'privacy',
        labelKey: 'registration.menu.privacy',
        titleKey: 'registration.menu.privacy',
        icon: 'mdi-shield-check',
        disabled: false,
        isValid: true,
        isTouched: false,
        backButtonTextKey: 'common.button.back',
        nextButtonTextKey: 'common.button.next',
        componentName: 'PrivacyStatement',
        helpLink: 'zendesk.beneficiary_registration.privacy_statement',
      },
      {
        id: 'personalInfo',
        labelKey: 'registration.menu.personal_info',
        titleKey: 'registration.menu.personal_info',
        icon: 'mdi-account',
        disabled: false,
        isValid: true,
        isTouched: false,
        backButtonTextKey: 'common.button.back',
        nextButtonTextKey: 'common.button.next',
        componentName: 'PersonalInformation',
        helpLink: 'zendesk.beneficiary_registration.personal_information',
      },
      ],
    i18n: {
      t: (t: string) => t,
    } as any,
    skipAgeRestriction: false,
    skipEmailPhoneRules: false,
    mode: ERegistrationMode.Self,
    householdApi: mockHouseholdsService(),
    publicApi: mockPublicService(),
  });

  registrationStore.getHouseholdCreate = jest.fn(() => new HouseholdCreate(mockHouseholdCreate()));
  registrationStore.getPreferredLanguages = jest.fn(() => mockPreferredLanguages());
  registrationStore.getPrimarySpokenLanguages = jest.fn(() => mockPrimarySpokenLanguages());
  registrationStore.getGenders = jest.fn(() => mockGenders());
  registrationStore.getEvent = jest.fn(() => mockEvent());
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
