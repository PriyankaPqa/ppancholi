import { IBeneficiary, IBeneficiaryData } from './beneficiary.types';
import { IAddress, Address } from '../value-objects/address';
import { IContactInformation, ContactInformation } from '../value-objects/contact-information';
import { IPerson, Person } from '../value-objects/person';

export class Beneficiary implements IBeneficiary {
  person: IPerson;

  contactInformation: IContactInformation;

  homeAddress: IAddress

  householdMembers: IPerson[];

  constructor(data?: IBeneficiaryData) {
    if (!data) {
      this.reset();
    } else {
      this.person = new Person(data.person);
      this.contactInformation = new ContactInformation(data.contactInformation);
      this.homeAddress = new Address(data.homeAddress);
      this.householdMembers = data.householdMembers ? data.householdMembers.map((h) => new Person(h)) : [];
    }
  }

  addHouseholdMember(newPerson: IPerson, sameAddress: boolean) {
    if (sameAddress) {
      newPerson.temporaryAddress = this.person.temporaryAddress;
    }
    this.householdMembers = [...this.householdMembers, newPerson];
  }

  removeHouseholdMember(index: number) {
    this.householdMembers = this.householdMembers.filter((h, i) => i !== index);
  }

  editHouseholdMember(newPerson: IPerson, index: number, sameAddress: boolean) {
    if (sameAddress) {
      newPerson.temporaryAddress = this.person.temporaryAddress;
    }
    const newHouseholdMembers = [...this.householdMembers];
    newHouseholdMembers[index] = newPerson;
    this.householdMembers = newHouseholdMembers;
  }

  reset() {
    this.person = new Person();
    this.contactInformation = new ContactInformation();
    this.homeAddress = new Address();
    this.householdMembers = [];
  }

  validateHouseholdMembers(): string[] {
    const householdMembersErrors = this.householdMembers.map((h) => h.validate(true));
    // We flatten the array
    return [].concat(...householdMembersErrors);
  }

  validate(): string[] {
    const personErrors = this.person.validate();
    const contactInformationErrors = this.contactInformation.validate();
    const homeAddressErrors = this.homeAddress.validate();
    const householdMembersErrors = this.validateHouseholdMembers();

    return [...personErrors, ...contactInformationErrors, ...homeAddressErrors, ...householdMembersErrors];
  }
}
