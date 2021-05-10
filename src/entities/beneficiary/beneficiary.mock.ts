import { mockHouseholdMembers, mockPersonData, mockPersonForCreate } from '../value-objects/person';
import { Beneficiary } from './beneficiary';
import { mockAddressData } from '../value-objects/address/address.mock';
import {
  IBeneficiaryData, IBeneficiary, ICreateBeneficiaryRequest, ICreateBeneficiaryResponse,
} from './beneficiary.types';
import { mockContactInformationData, mockContactInformationForCreate } from '../value-objects/contact-information/contactInformation.mock';

export const mockBeneficiaryData = (): IBeneficiaryData => ({
  noFixedHome: false,
  person: mockPersonData(),
  contactInformation: mockContactInformationData(),
  homeAddress: mockAddressData(),
  householdMembers: mockHouseholdMembers(),
});

export const mockBeneficiary = (force?: Partial<IBeneficiaryData>): IBeneficiary => new Beneficiary({ ...mockBeneficiaryData(), ...force });

export const mockBeneficiaryWithWrongAddress = (): IBeneficiary => mockBeneficiary({ homeAddress: mockAddressData({ streetAddress: null }) });

export const mockCreateBeneficiaryRequest = (): ICreateBeneficiaryRequest => ({
  noFixedHome: true,
  person: mockPersonForCreate(),
  contactInformation: mockContactInformationForCreate(),
  homeAddress: null,
  householdMembers: [],
  eventId: 'f4ec77c9-8b02-4ba6-9ba3-9c24e943afe8',
});

export const mockCreateBeneficiaryResponse = (): ICreateBeneficiaryResponse => ({
  ...mockCreateBeneficiaryRequest(),
  registrationNumber: '123',
});
