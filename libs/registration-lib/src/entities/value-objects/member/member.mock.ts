import deepmerge from 'deepmerge';
import { mockBaseData } from '@libs/core-lib/entities/base';
import { EIndigenousTypes } from '../identity-set/identitySet.types';
import { mockContactInformation, mockContactInformationCreateRequest } from '../contact-information';
import { mockIdentitySet, mockIdentitySetCreateRequest } from '../identity-set';
import { mockCampGround, mockCurrentAddressCreateRequest } from '../current-address';
import {
  IMember, IMemberEntity, IMemberMetadata, MemberCreateRequest,
} from './member.types';

import { Member } from './member';

export const mockMemberData = (): IMemberEntity => ({
  identitySet: mockIdentitySet(),
  contactInformation: mockContactInformation(),
  currentAddress: mockCampGround(),
} as IMemberEntity);

export const mockMember = (force?: Partial<IMemberEntity>): IMember => new Member(deepmerge(mockMemberData(), force || {}));

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

export const mockMemberMetadata = (force?: Partial<IMemberMetadata>) => ({
  ...mockBaseData(),
  shelterLocationId: '',
  shelterLocationName: { translation: { en: '' } },
  indigenousIdentityId: '',
  indigenousIdentityName: 'indigenous identity name',
  indigenousCommunityType: EIndigenousTypes.FirstNation,
  genderId: '',
  genderName: { translation: { en: 'male' } },
  preferredLanguageId: '',
  preferredLanguageName: { translation: { en: 'English' } },
  primarySpokenLanguageId: '',
  primarySpokenLanguageName: { translation: { en: 'French' } },
  ...force,
});
