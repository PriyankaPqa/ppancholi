import { IBeneficiary } from './beneficiary.types';
import { mockPersonalInformation } from './personalInformation/personalInformation.mock';

export const mockBeneficiary = (): IBeneficiary => ({
  privacyStatement: null,
  personalInformation: mockPersonalInformation(),
  addresses: null,
  householdMembers: null,
  reviewRegistration: null,
  validate: null,
});
