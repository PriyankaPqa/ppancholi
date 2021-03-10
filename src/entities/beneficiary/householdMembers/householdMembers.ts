import { IHouseholdMembers } from './householdMembers.types.';

export class HouseholdMembers implements IHouseholdMembers {
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
