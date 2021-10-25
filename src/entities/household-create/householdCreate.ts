import { IConsentInformation, IHouseholdCreate, IHouseholdCreateData } from './householdCreate.types';
import { IAddress, Address } from '../value-objects/address';
import { IMember, Member } from '../value-objects/member';

/*
 This entity is created and used by the FE for the registration. It's not coming from the BE.
 */

export class HouseholdCreate implements IHouseholdCreate {
  noFixedHome: boolean;

  primaryBeneficiary: IMember;

  homeAddress: IAddress

  additionalMembers: IMember[];

  consentInformation: IConsentInformation;

  id: uuid;

  registrationNumber?: string;

  constructor(data?: IHouseholdCreateData) {
    if (!data) {
      this.reset();
    } else {
      this.noFixedHome = data.noFixedHome;
      this.primaryBeneficiary = new Member(data.primaryBeneficiary);
      this.homeAddress = new Address(data.homeAddress);
      this.additionalMembers = data.additionalMembers ? data.additionalMembers.map((h) => new Member(h)) : [];
      this.consentInformation = data.consentInformation;
      this.id = data.id;
      this.registrationNumber = data.registrationNumber ? data.registrationNumber : '';
    }
  }

  addAdditionalMember(newPerson: IMember, sameAddress: boolean) {
    if (sameAddress) {
      newPerson.currentAddress = this.primaryBeneficiary.currentAddress;
    }
    this.additionalMembers = [...this.additionalMembers, newPerson];
  }

  removeAdditionalMember(index: number) {
    this.additionalMembers = this.additionalMembers.filter((h, i) => i !== index);
  }

  editAdditionalMember(newPerson: IMember, index: number, sameAddress: boolean) {
    if (sameAddress) {
      newPerson.currentAddress = this.primaryBeneficiary.currentAddress;
    }
    const newAdditionalMembers = [...this.additionalMembers];
    newAdditionalMembers[index] = newPerson;
    this.additionalMembers = newAdditionalMembers;
  }

  setPrimaryBeneficiary(member: IMember) {
    this.primaryBeneficiary = member ? new Member(member) : null;
  }

  reset() {
    this.noFixedHome = false;
    this.primaryBeneficiary = new Member();
    this.homeAddress = new Address();
    this.additionalMembers = [];
    this.consentInformation = {
      crcUserName: null,
      registrationMethod: null,
      registrationLocationId: null,
      privacyDateTimeConsent: null,
    };
    this.id = '';
    this.registrationNumber = '';
  }

  // Validation used for each page of registration

  validatePersonalInformation(skipAgeRestriction: boolean, skipEmailPhoneRules: boolean): string[] {
    const identityErrors = this.primaryBeneficiary.validateIdentity(skipAgeRestriction);
    const contactInformationErrors = this.primaryBeneficiary.validateContactInformation(skipEmailPhoneRules);
    return [...identityErrors, ...contactInformationErrors];
  }

  validateAddresses(noFixedHome: boolean): string[] {
    let homeAddressValidation: string[] = [];
    // Only validate HomeAddress if has a fixed home
    if (!noFixedHome) {
      homeAddressValidation = this.homeAddress.validate();
    }
    return homeAddressValidation.concat(this.primaryBeneficiary.currentAddress.validate());
  }

  validateAdditionalMembers(): string[] {
    const errors = this.additionalMembers.map((member) => {
      const identityErrors = member.validateIdentity(true);
      const addressErrors = member.validateCurrentAddress();
      return [...identityErrors, ...addressErrors];
    });
    // We flatten the array
    return [].concat(...errors);
  }

  // eslint-disable-next-line
  validate({ noFixedHome, skipAgeRestriction, skipEmailPhoneRules }: {noFixedHome: boolean; skipAgeRestriction: boolean; skipEmailPhoneRules: boolean}): string[] {
    const primaryBeneficiaryErrors = this.primaryBeneficiary.validate(skipAgeRestriction);
    const homeAddressErrors = noFixedHome ? [''] : this.homeAddress.validate();
    const additionalMembersErrors = this.validateAdditionalMembers();

    return [...primaryBeneficiaryErrors, ...homeAddressErrors, ...additionalMembersErrors];
  }
}
