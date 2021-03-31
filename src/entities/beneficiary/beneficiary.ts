import { IBeneficiary, IBeneficiaryData } from './beneficiary.types';
import { IAddresses } from './addresses/addresses.types';
import { IPersonalInformation } from './personalInformation/personalInformation.types';
import { IHouseholdMembers } from './householdMembers/householdMembers.types.';
import { Addresses } from './addresses/addresses';
import { PersonalInformation } from './personalInformation/personalInformation';
import { HouseholdMembers } from './householdMembers/householdMembers';

export class Beneficiary implements IBeneficiary {
  constructor(data?: IBeneficiaryData) {
    if (!data) {
      this.reset();
    }
  }

  personalInformation: IPersonalInformation;

  addresses: IAddresses;

  householdMembers: IHouseholdMembers;

  reset() {
    this.personalInformation = new PersonalInformation();
    this.addresses = new Addresses();
    this.householdMembers = new HouseholdMembers();
  }

  validate(): string[] {
    throw new Error('Method not implemented.');
  }
}
