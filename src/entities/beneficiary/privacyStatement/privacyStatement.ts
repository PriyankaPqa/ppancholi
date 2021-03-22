import { required } from '@/entities/commonValidation';
import { IPrivacyStatement } from './privacyStatement.types';

export class PrivacyStatement implements IPrivacyStatement {
  isPrivacyAgreed: boolean;

  privacyDateTimeConsent: string;

  constructor(data?: unknown) {
    if (!data) {
      this.reset();
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    required(this.isPrivacyAgreed, 'privacy statement is required', errors);

    return errors;
  }

  reset(): void {
    this.isPrivacyAgreed = false;
    this.privacyDateTimeConsent = null;
  }
}
