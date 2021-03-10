import { IReviewRegistration } from './reviewRegistration.types';

export class ReviewRegistration implements IReviewRegistration {
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
