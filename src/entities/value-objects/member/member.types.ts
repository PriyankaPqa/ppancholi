import { IMultilingual } from '@/types';
import { EIndigenousTypes } from '../identity-set/identitySet.types';
import { IIdentitySet, IIdentitySetCreateRequest } from '../identity-set';
import { IContactInformation, IContactInformationCreateRequest } from '../contact-information';
import { ICurrentAddress, ICurrentAddressCreateRequest } from '../current-address/currentAddress.types';
import { IEntity } from '../../base';

export interface IMemberEntity extends IEntity {
  identitySet: IIdentitySet;

  currentAddress: ICurrentAddress;

  contactInformation: IContactInformation;

  addressHistory: Array<string>;
}

export interface IMemberMetadata extends IEntity {
  shelterLocationId: uuid;
  shelterLocationName: IMultilingual;
  indigenousIdentityId: uuid;
  indigenousIdentityName: IMultilingual;
  indigenousCommunityType: EIndigenousTypes;
  genderId: uuid;
  genderName: IMultilingual;
  preferredLanguageId: uuid;
  preferredLanguageName: IMultilingual;
  primarySpokenLanguageId: uuid;
  primarySpokenLanguageName: IMultilingual;
}

export interface MemberCreateRequest {
  identitySet: IIdentitySetCreateRequest;
  currentAddress: ICurrentAddressCreateRequest;
  contactInformation: IContactInformationCreateRequest;
}

export interface IMemberMoveRequest {
  isPrimaryBeneficiary: boolean;
  preferredLanguageId: uuid;
  memberId: uuid;
  currentAddress: ICurrentAddressCreateRequest;
}

export interface IMember extends IMemberEntity {
  setCurrentAddress(currentAddress: ICurrentAddress): void;
  validate(skipAgeRestriction?: boolean): string[];
  validateIdentity(skipAgeRestriction: boolean): string[];
  validateCurrentAddress(): string[];
  validateContactInformation(skipEmailPhoneRules: boolean): string[];
}
