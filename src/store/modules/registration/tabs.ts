import { IRegistrationMenuItem } from '@crctech/registration-lib/src/types/interfaces/IRegistrationMenuItem';

export const tabs = (): IRegistrationMenuItem[] => [
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
  {
    id: 'addresses',
    labelKey: 'registration.menu.addresses',
    titleKey: 'registration.menu.addresses',
    icon: 'mdi-map-marker',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'common.button.next',
    componentName: 'Addresses',
    helpLink: 'zendesk.beneficiary_registration.addresses',
  },
  {
    id: 'additionalMembers',
    labelKey: 'registration.menu.household_members',
    titleKey: 'registration.menu.household_members',
    icon: 'mdi-account-multiple',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'common.button.next',
    componentName: 'AdditionalMembers',
    helpLink: 'zendesk.beneficiary_registration.household_members',
  },
  {
    id: 'review',
    labelKey: 'registration.menu.review',
    titleKey: 'registration.menu.review',
    icon: 'mdi-file-search',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'registration.submit_registration.label',
    componentName: 'ReviewRegistration',
    helpLink: 'zendesk.beneficiary_registration.review_confirm',
  },
  {
    id: 'confirmation',
    labelKey: 'registration.menu.confirmation',
    titleKey: 'registration.page.confirmation',
    icon: 'mdi-check',
    disabled: true,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.print',
    nextButtonTextKey: 'registration.close_registration.label',
    componentName: 'ConfirmRegistration',
    helpLink: 'zendesk.beneficiary_registration.review_confirm',
  },
];
