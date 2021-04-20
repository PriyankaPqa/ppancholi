import { mockHouseholdMembers, mockPersonData } from '@/entities/value-objects/person';
import { Beneficiary } from './beneficiary';
import { mockAddressData } from '../value-objects/address/address.mock';
import { IBeneficiaryData, IBeneficiary } from './beneficiary.types';
import { mockContactInformationData } from '../value-objects/contact-information/contactInformation.mock';

export const mockBeneficiaryData = (): IBeneficiaryData => ({
  person: mockPersonData(),
  contactInformation: mockContactInformationData(),
  homeAddress: mockAddressData(),
  householdMembers: mockHouseholdMembers(),
});

export const mockBeneficiary = (force?: Partial<IBeneficiaryData>): IBeneficiary => new Beneficiary(
  { ...mockBeneficiaryData(), ...force },
);

export const mockBeneficiaryWithWrongAddress = (): IBeneficiary => mockBeneficiary({ homeAddress: mockAddressData({ street: null }) });
