import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';
import { IIdentitySet } from '../value-objects/identity-set';
import { ICurrentAddress } from '../value-objects/current-address';
import { IConsentInformation, IHouseholdCreate, IHouseholdCreateData } from './householdCreate.types';
import { IAddress, Address } from '../value-objects/address';
import { IMember, Member } from '../value-objects/member';

/*
 This entity is created and used by the FE for the registration. It's not coming from the BE.
 */

export class HouseholdCreate implements IHouseholdCreate {
  noFixedHome: boolean;

  primaryBeneficiary: IMember;

  homeAddress: IAddress;

  additionalMembers: IMember[];

  consentInformation: IConsentInformation;

  id: uuid;

  registrationNumber?: string;

  constructor(data?: IHouseholdCreateData) {
    if (!data) {
      this.reset();
    } else {
      this.noFixedHome = data.noFixedHome;
      this.primaryBeneficiary = data.primaryBeneficiary ? new Member(data.primaryBeneficiary) : null;
      this.homeAddress = new Address(data.homeAddress);
      this.additionalMembers = data.additionalMembers ? data.additionalMembers.map((h) => new Member(h)) : [];
      this.consentInformation = _cloneDeep(data.consentInformation);
      this.id = data.id;
      this.registrationNumber = data.registrationNumber ? data.registrationNumber : '';
    }
  }

  addAdditionalMember(newPerson: IMember, sameAddress: boolean) {
    if (sameAddress) {
      newPerson.currentAddress = _cloneDeep(this.primaryBeneficiary.currentAddress);
    }
    this.additionalMembers = [...this.additionalMembers, _cloneDeep(newPerson)];
  }

  removeAdditionalMember(index: number) {
    this.additionalMembers = this.additionalMembers.filter((h, i) => i !== index);
  }

  editAdditionalMember(newPerson: IMember, index: number, sameAddress: boolean) {
    if (sameAddress) {
      newPerson.currentAddress = _cloneDeep(this.primaryBeneficiary.currentAddress);
    }
    const newAdditionalMembers = _cloneDeep(this.additionalMembers) || [];
    newAdditionalMembers[index] = _cloneDeep(newPerson);
    this.additionalMembers = newAdditionalMembers;
  }

  setPrimaryBeneficiary(member: IMember) {
    this.primaryBeneficiary = member ? new Member(member) : null;
  }

  setHomeAddress(address: IAddress) {
    this.homeAddress = new Address(address);
  }

  setCurrentAddress(address: ICurrentAddress) {
    const oldAddress = this.primaryBeneficiary.currentAddress;

   this.additionalMembers.forEach((m: IMember) => {
      if (_isEqual(m.currentAddress, oldAddress)) {
        m.setCurrentAddress(address);
      }
    });
    this.primaryBeneficiary.setCurrentAddress(address);
  }

  isDuplicateMember(form: IIdentitySet, isPrimaryBeneficiary:boolean = false, index = -1, memberId = ''): boolean {
    if (form.firstName && form.lastName && form.dateOfBirth) {
      let members = [...this.additionalMembers];
      // remove the member themselves, so we do not compare with self
      if (index >= 0) {
        members.splice(index, 1);
      }
      // Remove the member themselves if we know their Id (used in makePrimaryMember)
      if (memberId) {
        members = members.filter((m) => m.id !== memberId);
      }
      // we do not want to compare the primary beneficiary with themselves, only add when we compare additional members
      if (!isPrimaryBeneficiary) {
        members.push(this.primaryBeneficiary);
      }

      return members.some((m:IMember) => this.hasSameNameAndDOB(form, m.identitySet));
    }

    return false;
  }

  reset() {
    this.noFixedHome = false;
    this.primaryBeneficiary = new Member();
    this.homeAddress = new Address();
    this.additionalMembers = [];
    this.consentInformation = {
      crcUserName: '',
      registrationMethod: null,
      registrationLocationId: null,
      privacyDateTimeConsent: null,
    };
    this.id = '';
    this.registrationNumber = '';
  }

  // Validation used for each page of registration

  validatePersonalInformation(skipAgeRestriction: boolean, skipEmailPhoneRules: boolean, isCRCRegistration:boolean = true): string[] {
    const identityErrors = this.primaryBeneficiary.validateIdentity(skipAgeRestriction, isCRCRegistration);
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

 private hasSameNameAndDOB?(form: IIdentitySet, memberIdentity: IIdentitySet): boolean {
    if (!memberIdentity?.firstName || !memberIdentity.lastName || !memberIdentity.dateOfBirth) {
      return false;
    }

    return form.dateOfBirth === memberIdentity.dateOfBirth
    && form.firstName.toLowerCase() === memberIdentity.firstName.toLowerCase()
    && form.lastName.toLowerCase() === memberIdentity.lastName.toLowerCase();
  }
}
