import { BaseEntity } from '../../base';
import { ContactInformation, IContactInformation } from '../contact-information';
import { IdentitySet, IIdentitySet } from '../identity-set';
import { CurrentAddress, ICurrentAddress } from '../current-address';

import { IMember, IMemberEntity } from './member.types';

export class Member extends BaseEntity implements IMember {
  identitySet: IIdentitySet;

  currentAddress: ICurrentAddress;

  contactInformation: IContactInformation;

  addressHistory: ICurrentAddress[];

  constructor(data?: IMemberEntity) {
    if (!data) {
      super();
      this.reset();
    } else {
      super(data);
      this.setIdentity(data.identitySet);
      this.setCurrentAddress(data.currentAddress);
      this.setContactInformation(data.contactInformation);
      this.addressHistory = data.addressHistory?.map((h) => new CurrentAddress(h)) || [];
    }
  }

  setCurrentAddress(currentAddress: ICurrentAddress) {
    this.currentAddress = new CurrentAddress(currentAddress);
  }

  setIdentity(identitySet: IIdentitySet) {
    this.identitySet = new IdentitySet(identitySet);
  }

  setPersonalInformation(contactInformation: IContactInformation, identitySet: IIdentitySet) {
    this.setContactInformation(contactInformation);
    this.setIdentity(identitySet);
  }

  setContactInformation(contactInformation: IContactInformation) {
    this.contactInformation = new ContactInformation(contactInformation);
  }

  validate(skipAgeRestriction = false, skipEmailPhoneRules = false): string[] {
    const identityErrors = this.validateIdentity(skipAgeRestriction);

    const currentAddressErrors = this.validateCurrentAddress();

    const contactInformationErrors = this.validateContactInformation(skipEmailPhoneRules);

    return [...identityErrors, ...currentAddressErrors, ...contactInformationErrors];
  }

  validateCurrentAddress(): Array<string> {
    return this.currentAddress.validate();
  }

  validateIdentity(skipAgeRestriction: boolean): Array<string> {
    return this.identitySet.validate(skipAgeRestriction);
  }

  validateContactInformation(skipEmailPhoneRules: boolean): Array<string> {
    return this.contactInformation.validate(skipEmailPhoneRules);
  }

  private reset(): void {
    this.identitySet = new IdentitySet();
    this.contactInformation = new ContactInformation();
    this.currentAddress = new CurrentAddress();
    this.addressHistory = [];
  }
}
