import deepmerge from 'deepmerge';
import {
  mockAdditionalMembers, mockMemberData, mockMemberCreateRequest,
} from '../value-objects/member';
import { HouseholdCreate } from './householdCreate';
import { mockAddressData } from '../value-objects/address/address.mock';
import {
  IHouseholdCreateData, IHouseholdCreate, ICreateHouseholdRequest,
} from './householdCreate.types';

export const mockHouseholdCreateData = (): IHouseholdCreateData => ({
  noFixedHome: false,
  primaryBeneficiary: mockMemberData(),
  homeAddress: mockAddressData(),
  additionalMembers: mockAdditionalMembers(),
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
});
