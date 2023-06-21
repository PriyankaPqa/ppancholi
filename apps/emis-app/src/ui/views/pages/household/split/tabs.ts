import { IRegistrationMenuItem } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';

export const tabs = (): IRegistrationMenuItem[] => [
  {
    id: 'isRegistered',
    labelKey: 'registration.menu.isIndividualRegistered',
    titleKey: 'registration.menu.isIndividualRegistered',
    icon: '',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'common.button.next',
    componentName: 'isRegistered',
    helpLink: '',
  },
  {
    id: 'event',
    labelKey: 'household.split.choose_event',
    titleKey: 'household.split.select_event',
    icon: '',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'common.button.next',
    componentName: 'SplitHouseholdEvent',
    helpLink: '',
  },
  {
    id: 'personalInfo',
    labelKey: 'registration.menu.personal_info',
    titleKey: 'registration.menu.personal_info',
    icon: '',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'common.button.next',
    componentName: 'PersonalInformation',
    helpLink: '',
  },
  {
    id: 'addresses',
    labelKey: 'registration.menu.addresses',
    titleKey: 'registration.menu.addresses',
    icon: '',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'common.button.next',
    componentName: 'Addresses',
    helpLink: '',
  },
  {
    id: 'additionalSplitMembers',
    labelKey: 'registration.menu.household_members',
    titleKey: 'registration.menu.household_members',
    icon: '',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'household.split.review_split_information',
    componentName: 'SplitHouseholdMembers',
    helpLink: '',
  },
  {
    id: 'reviewSplitInfo',
    labelKey: 'household.split.review_split_info',
    titleKey: 'household.split.review_split_information',
    icon: '',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'common.button.next',
    componentName: 'ReviewSplit',
    helpLink: '',
  },
  {
    id: 'confirmation',
    labelKey: 'household.split.confirm_split',
    titleKey: 'household.split.split_confirmation',
    icon: '',
    disabled: true,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.print',
    nextButtonTextKey: 'caseFileDetail.household_profile.button',
    componentName: 'ConfirmRegistration',
    helpLink: '',
  },
  {
    id: 'assessment',
    labelKey: 'registration.menu.assessment',
    titleKey: 'registration.page.assessment',
    icon: '',
    disabled: true,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.print',
    nextButtonTextKey: 'registration.close_registration.label',
    componentName: 'ConfirmRegistration',
    helpLink: '',
  },
];
