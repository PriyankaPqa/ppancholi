import { mockPerson } from '@/entities/beneficiary/person';
import { mockAddresses } from './addresses/addresses.mock';
import { IBeneficiaryData } from './beneficiary.types';
import { mockContactInformation } from './contactInformation/contactInformation.mock';

export const mockBeneficiary = (): IBeneficiaryData => ({
  person: mockPerson(),
  contactInformation: mockContactInformation(),
  addresses: mockAddresses(),
  householdMembers: null,
});
