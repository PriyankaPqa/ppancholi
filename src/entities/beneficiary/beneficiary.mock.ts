import { mockAddresses } from './addresses/addresses.mock';
import { IBeneficiary } from './beneficiary.types';
import { mockPersonalInformation } from './personalInformation/personalInformation.mock';

export const mockBeneficiary = (): IBeneficiary => ({
  personalInformation: mockPersonalInformation(),
  addresses: mockAddresses(),
  householdMembers: null,
  validate: null,
});
