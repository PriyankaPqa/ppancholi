import { IEntity } from '@/types';

export interface IPrivacyStatement extends IEntity {
  isPrivacyAgreed: boolean;
  privacyDateTimeConsent: string;
}
