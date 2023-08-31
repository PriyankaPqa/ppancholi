export interface IRegistrationMenuItem {
  id: string;
  labelKey: string;
  titleKey: string;
  icon: string;
  disabled: boolean;
  isValid: boolean;
  isTouched: boolean;
  backButtonTextKey: string;
  nextButtonTextKey: string;
  componentName: string;
  helpLink: string;
}

export enum TabId {
  Privacy = 'privacy',
  PersonalInfo = 'personalInfo',
  Addresses = 'addresses',
  AdditionalMembers = 'additionalMembers',
  Review = 'review',
  Confirmation = 'confirmation',
  Assessment = 'assessment',
  Tier2auth = 'tier2auth',
  IsRegistered = 'isRegistered',
  Event = 'event',
  AdditionalSplitMembers = 'additionalSplitMembers',
  ReviewSplitInfo = 'reviewSplitInfo',
}
