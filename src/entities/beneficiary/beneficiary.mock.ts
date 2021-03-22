import { mockAddresses } from './addresses/addresses.mock';
import { IBeneficiary } from './beneficiary.types';
import { mockPersonalInformation } from './personalInformation/personalInformation.mock';

export const mockBeneficiary = (): IBeneficiary => ({
  privacyStatement: null,
  personalInformation: mockPersonalInformation(),
  addresses: mockAddresses(),
  householdMembers: null,
  reviewRegistration: null,
  validate: null,
});
