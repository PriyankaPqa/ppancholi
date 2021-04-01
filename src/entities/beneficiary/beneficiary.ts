import { IPerson } from '@/entities/beneficiary/person';
import { IBeneficiary, IBeneficiaryData } from './beneficiary.types';
import { IAddresses } from './addresses/addresses.types';
import { IContactInformation } from './contactInformation/contactInformation.types';
import { IHouseholdMembers } from './householdMembers/householdMembers.types.';
import { Addresses } from './addresses/addresses';
import { ContactInformation } from './contactInformation/contactInformation';
import { HouseholdMembers } from './householdMembers/householdMembers';
import { Person } from './person/person';

export class Beneficiary implements IBeneficiary {
  constructor(data?: IBeneficiaryData) {
    if (!data) {
      this.reset();
    }
  }

  person: IPerson;

  contactInformation: IContactInformation;

  addresses: IAddresses;

  householdMembers: IHouseholdMembers;

  reset() {
    this.person = new Person();
    this.contactInformation = new ContactInformation();
    this.addresses = new Addresses();
    this.householdMembers = new HouseholdMembers();
  }

  validate(): string[] {
    throw new Error('Method not implemented.');
  }
}
