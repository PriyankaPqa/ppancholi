import deepmerge from 'deepmerge';

import { mockContactInformation, mockContactInformationCreateRequest } from '../contact-information';
import { mockIdentitySet, mockIdentitySetCreateRequest } from '../identity-set';
import { mockCampGround, mockCurrentAddressCreateRequest } from '../current-address';
import {
  IMember, IMemberData, MemberCreateRequest,
} from './member.types';

import { Member } from './member';

export const mockMemberData = (): IMemberData => ({
  identitySet: mockIdentitySet(),
  contactInformation: mockContactInformation(),
  currentAddress: mockCampGround(),
} as IMemberData);

export const mockMember = (force?: Partial<IMemberData>): IMember => new Member(deepmerge(mockMemberData(), force || {}));

export const mockAdditionalMember = (force?: Partial<IMember>): IMember => new Member(deepmerge(mockMemberData(), force || {}));

export const mockAdditionalMembers = (): IMember[] => [
  mockMember(),
  mockMember(),
  mockMember(),
];

export const mockMemberCreateRequest = (): MemberCreateRequest => ({
  identitySet: mockIdentitySetCreateRequest(),
  currentAddress: mockCurrentAddressCreateRequest(),
  contactInformation: mockContactInformationCreateRequest(),
});
