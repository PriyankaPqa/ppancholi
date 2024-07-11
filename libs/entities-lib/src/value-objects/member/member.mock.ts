import deepmerge from 'deepmerge';
import { mockContactInformation, mockContactInformationCreateRequest } from '../contact-information';
import { mockIdentitySet, mockIdentitySetCreateRequest } from '../identity-set';
import { mockCampGround, mockCurrentAddressCreateRequest, mockOther } from '../current-address';
import {
  IMember, IMemberEntity, MemberCreateRequest,
} from './member.types';
import { mockBaseData } from '../../base';

import { Member } from './member';

export const mockMemberData = (): IMemberEntity => ({
  ...mockBaseData(),
  identitySet: mockIdentitySet(),
  contactInformation: mockContactInformation(),
  currentAddress: mockCampGround(),
  addressHistory: [mockOther(), mockCampGround()],
});

export const mockMember = (force?: Partial<IMemberEntity>): IMember => new Member(deepmerge(mockMemberData(), force || {}));

export const mockAdditionalMember = (force?: Partial<IMember>): IMember => new Member(deepmerge(mockMemberData(), force || {}));

export const mockAdditionalMembers = (): IMember[] => [
  mockMember({ id: '1' }),
  mockMember({ id: '2' }),
  mockMember({ id: '3' }),
];

export const mockMemberCreateRequest = (): MemberCreateRequest => ({
  identitySet: mockIdentitySetCreateRequest(),
  currentAddress: mockCurrentAddressCreateRequest(),
  contactInformation: mockContactInformationCreateRequest(),
});
