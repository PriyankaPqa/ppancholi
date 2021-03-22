import { IPrivacyStatement } from './privacyStatement.types';

export const mockPrivacyStatement = (): IPrivacyStatement => ({
  isPrivacyAgreed: true,
  privacyDateTimeConsent: '2021-03-15T14:27:15-04:00',

  validate: null,
});
