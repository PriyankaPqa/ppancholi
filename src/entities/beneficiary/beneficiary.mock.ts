import { mockHouseholdMember, mockPersonData } from '@/entities/value-objects/person';
import { Beneficiary } from './beneficiary';
import { mockAddressData } from '../value-objects/address/address.mock';
import { IBeneficiaryData, IBeneficiary } from './beneficiary.types';
import { mockContactInformationData } from '../value-objects/contact-information/contactInformation.mock';

export const mockBeneficiaryData = (): IBeneficiaryData => ({
  person: mockPersonData(),
  contactInformation: mockContactInformationData(),
  homeAddress: mockAddressData(),
  householdMembers: [mockHouseholdMember()],
});

export const mockBeneficiary = (): IBeneficiary => new Beneficiary(mockBeneficiaryData());
