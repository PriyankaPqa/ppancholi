import { IBeneficiary } from './beneficiary.types';
import { IAddresses } from './addresses/addresses.types';
import { IPrivacyStatement } from './privacyStatement/privacyStatement.types';
import { IPersonalInformation } from './personalInformation/personalInformation.types';
import { IHouseholdMembers } from './householdMembers/householdMembers.types.';
import { IReviewRegistration } from './reviewRegistration/reviewRegistration.types';
import { Addresses } from './addresses/addresses';
import { PrivacyStatement } from './privacyStatement/privacyStatement';
import { PersonalInformation } from './personalInformation/personalInformation';
import { HouseholdMembers } from './householdMembers/householdMembers';
import { ReviewRegistration } from './reviewRegistration/reviewRegistration';

export class Beneficiary implements IBeneficiary {
  constructor(data?: unknown) {
    if (!data) {
      this.reset();
    }
  }

  privacyStatement: IPrivacyStatement;

  personalInformation: IPersonalInformation;

  addresses: IAddresses;

  householdMembers: IHouseholdMembers;

  reviewRegistration: IReviewRegistration;

  reset() {
    this.privacyStatement = new PrivacyStatement();
    this.personalInformation = new PersonalInformation();
    this.addresses = new Addresses();
    this.householdMembers = new HouseholdMembers();
    this.reviewRegistration = new ReviewRegistration();
  }

  validate(): string[] {
    throw new Error('Method not implemented.');
  }
}
