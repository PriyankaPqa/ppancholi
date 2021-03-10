import { IAddresses } from './addresses.types';

export class Addresses implements IAddresses {
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
