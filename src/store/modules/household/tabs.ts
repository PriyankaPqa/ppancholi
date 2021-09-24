import { IRegistrationMenuItem } from '@crctech/registration-lib/src/types/interfaces/IRegistrationMenuItem';

export const tabs = (): IRegistrationMenuItem[] => [
  {
    id: 'isRegistered',
    labelKey: 'household.split.beneficiary_search',
    titleKey: 'registration.menu.is_registered',
    icon: '',
    disabled: false,
    isValid: true,
    isTouched: false,
    backButtonTextKey: 'common.button.back',
    nextButtonTextKey: 'common.button.next',
    componentName: 'isRegistered',
    helpLink: '',
  },
];
