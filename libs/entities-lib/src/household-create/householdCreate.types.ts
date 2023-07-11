import { ERegistrationMode, ERegistrationMethod } from '@libs/shared-lib/types';
import { IIdentitySet } from '../value-objects/identity-set';
import { IAddress, IAddressData } from '../value-objects/address/address.types';
import {
  IMemberEntity, IMember, MemberCreateRequest, IMemberMoveRequest,
} from '../value-objects/member';
import { ICurrentAddress } from '../value-objects/current-address';

export interface ISplitHouseholdMembers {
  primaryMember: IMember;
  additionalMembers: IMember[];
}

export interface ISplitHousehold {
  originHouseholdId: string;
  splitMembers: ISplitHouseholdMembers;
}

export interface IConsentInformation {
  crcUserName: string;
  registrationLocationId: string;
  registrationMethod: ERegistrationMethod;
  privacyDateTimeConsent: string;
}

export interface IHouseholdCreateData {
  primaryBeneficiary: IMemberEntity;
  noFixedHome: boolean;
  homeAddress: IAddressData;
  additionalMembers: IMemberEntity[];
  consentInformation: IConsentInformation;
  id?: uuid;
  registrationNumber?: string;
  created?: string;
}

export interface IHouseholdCreate {
  primaryBeneficiary: IMember;
  noFixedHome: boolean;
  homeAddress: IAddress;
  additionalMembers: IMember[];
  consentInformation: IConsentInformation;
  id?: uuid;
  registrationNumber?: string;

  addAdditionalMember(newPerson: IMember, sameAddress: boolean): void;
  removeAdditionalMember(index: number): void;
  editAdditionalMember(newPerson: IMember, index: number, sameAddress: boolean): void;
  setPrimaryBeneficiary(member: IMember): void;
  setHomeAddress(address: IAddress): void;
  setCurrentAddress(address: ICurrentAddress): void;
  isDuplicateMember(form: IIdentitySet, isPrimaryBeneficiary:boolean, index?: number): boolean;
  validatePersonalInformation(skipAgeRestriction: boolean, skipEmailPhoneRules: boolean): string[];
  validateAddresses(noFixedHome: boolean): string[];
  validateAdditionalMembers(): string[];
  // eslint-disable-next-line
  validate({
    noFixedHome,
    skipAgeRestriction,
    skipEmailPhoneRules,
  }: {
    noFixedHome: boolean;
    skipAgeRestriction: boolean;
    skipEmailPhoneRules: boolean;
  }): string[];
}

export interface ICreateHouseholdRequest {
  noFixedHome: boolean;
  primaryBeneficiary: MemberCreateRequest;
  homeAddress: IAddressData;
  additionalMembers: MemberCreateRequest[];
  eventId: uuid;
  consentInformation: IConsentInformation;
  // name is honey pot - it should always be null...
  name?: string;
}

export interface ISplitHouseholdRequest {
  noFixedHome: boolean;
  primaryBeneficiaryId: uuid;
  primaryBeneficiary: MemberCreateRequest;
  homeAddress: IAddressData;
  additionalMemberIds: uuid[];
  eventId: uuid;
  consentInformation: IConsentInformation;
  registrationType: ERegistrationMode;
}

export interface IMoveHouseholdRequest {
  firstHouseholdId: uuid;
  firstHouseholdMembers: IMemberMoveRequest[];
  secondHouseholdId: uuid;
  secondHouseholdMembers: IMemberMoveRequest[];
}
