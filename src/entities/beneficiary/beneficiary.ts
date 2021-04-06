import { IPerson } from '@/entities/value-objects/person';
import { IBeneficiary, IBeneficiaryData } from './beneficiary.types';
import { IAddress, Address } from '../value-objects/address';
import { IContactInformation, ContactInformation } from '../value-objects/contact-information';
import { IHouseholdMembers, HouseholdMembers } from '../value-objects/household-members';

import { Person } from '../value-objects/person/person';

export class Beneficiary implements IBeneficiary {
  person: IPerson;

  contactInformation: IContactInformation;

  homeAddress: IAddress

  householdMembers: IHouseholdMembers;

  constructor(data?: IBeneficiaryData) {
    if (!data) {
      this.reset();
    } else {
      this.person = new Person(data.person);
      this.contactInformation = new ContactInformation(data.contactInformation);
      this.homeAddress = new Address(data.homeAddress);
      this.householdMembers = new HouseholdMembers(data.householdMembers);
    }
  }

  reset() {
    this.person = new Person();
    this.contactInformation = new ContactInformation();
    this.homeAddress = new Address();
    this.householdMembers = new HouseholdMembers();
  }

  validate(): string[] {
    const personErrors = this.person.validate();
    const contactInformationErrors = this.contactInformation.validate();
    const homeAddressErrors = this.homeAddress.validate();
    const householdMembersErrors = this.householdMembers.validate();

    return [...personErrors, ...contactInformationErrors, ...homeAddressErrors, ...householdMembersErrors];
  }
}
