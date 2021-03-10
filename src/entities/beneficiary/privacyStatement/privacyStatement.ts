import { IPrivacyStatement } from './privacyStatement.types';

export class PrivacyStatement implements IPrivacyStatement {
  constructor(data?: unknown) {
    if (!data) {
      this.reset();
    }
  }

  validate(): string[] {
    throw new Error('Method not implemented.');
  }

  reset(): void {
    // TODO
  }
}
