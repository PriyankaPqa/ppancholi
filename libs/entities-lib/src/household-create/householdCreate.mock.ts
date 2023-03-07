import deepmerge from 'deepmerge';
import { ERegistrationMode } from '@libs/shared-lib/types';
import {
  mockAdditionalMembers, mockMemberData, mockMemberCreateRequest, mockMember,
} from '../value-objects/member';
import { HouseholdCreate } from './householdCreate';
import { mockAddressData } from '../value-objects/address/address.mock';
import {
  IHouseholdCreateData, IHouseholdCreate, ICreateHouseholdRequest, ISplitHouseholdRequest,
} from './householdCreate.types';

export const mockHouseholdCreateData = (): IHouseholdCreateData => ({
  noFixedHome: false,
  primaryBeneficiary: mockMemberData(),
  homeAddress: mockAddressData(),
  additionalMembers: mockAdditionalMembers(),
  consentInformation: {
    crcUserName: '',
    registrationMethod: null,
    registrationLocationId: null,
    privacyDateTimeConsent: null,
  },
});

export const mockHouseholdCreate = (force?: Partial<IHouseholdCreateData>): IHouseholdCreate => new HouseholdCreate(
  deepmerge(mockHouseholdCreateData(), force || {}),
);

export const mockCreateHouseholdRequest = (): ICreateHouseholdRequest => ({
  noFixedHome: true,
  primaryBeneficiary: mockMemberCreateRequest(),
  homeAddress: null,
  additionalMembers: [],
  eventId: 'f4ec77c9-8b02-4ba6-9ba3-9c24e943afe8',
  consentInformation: null,
});

export const mockSplitHouseholdRequest = (): ISplitHouseholdRequest => ({
  noFixedHome: true,
  primaryBeneficiary: mockMemberCreateRequest(),
  primaryBeneficiaryId: 'f4ec77c9-8b02-4ba6-9ba3-9c24e943afe8',
  homeAddress: null,
  additionalMemberIds: ['f4ec77c9-8b02-4ba6-9ba3-9c24e943afe8'],
  eventId: 'f4ec77c9-8b02-4ba6-9ba3-9c24e943afe8',
  consentInformation: null,
  registrationType: ERegistrationMode.CRC,
});

export const mockSplitHousehold = () => ({
  originHouseholdId: 'f4ec77c9-8b02-4ba6-9ba3-9c24e943afe8',
  splitMembers: {
    primaryMember: mockMember({ id: 'id-1' }),
    additionalMembers: [mockMember({ id: 'id-2' })],
  },
});
