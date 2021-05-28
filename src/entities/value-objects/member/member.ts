import { ContactInformation, IContactInformation } from '../contact-information';
import { IdentitySet, IIdentitySet } from '../identity-set';
import { CurrentAddress, ICurrentAddress } from '../current-address';

import { IMember, IMemberData } from './member.types';

export class Member implements IMember {
  tenantId: uuid;

  identitySet: IIdentitySet

  currentAddress: ICurrentAddress;

  contactInformation: IContactInformation;

  constructor(data?: IMemberData) {
    if (!data) {
      this.reset();
    } else {
      this.identitySet = new IdentitySet(data.identitySet);
      this.currentAddress = new CurrentAddress(data.currentAddress);
      this.contactInformation = new ContactInformation(data.contactInformation);
    }
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
  }
}
