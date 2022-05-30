import _cloneDeep from 'lodash/cloneDeep';
import { BaseEntity } from '@libs/core-lib/entities/base';
import { ContactInformation, IContactInformation } from '../contact-information';
import { IdentitySet, IIdentitySet } from '../identity-set';
import { CurrentAddress, ICurrentAddress } from '../current-address';

import { IMember, IMemberEntity } from './member.types';

export class Member extends BaseEntity implements IMember {
  identitySet: IIdentitySet

  currentAddress: ICurrentAddress;

  contactInformation: IContactInformation;

  addressHistory: string[];

  constructor(data?: IMemberEntity) {
    if (!data) {
      super();
      this.reset();
    } else {
      super(data);
      this.identitySet = new IdentitySet(data.identitySet);
      this.currentAddress = new CurrentAddress(data.currentAddress);
      this.contactInformation = new ContactInformation(data.contactInformation);
      this.addressHistory = data.addressHistory ? [...data.addressHistory] : [];
    }
  }

  setCurrentAddress(currentAddress: ICurrentAddress) {
    this.currentAddress = _cloneDeep(currentAddress);
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
