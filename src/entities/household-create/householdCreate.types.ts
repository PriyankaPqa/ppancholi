import { ERegistrationMode } from '../../types/enums/ERegistrationMode';
import { ERegistrationMethod } from '../../types';
import { IAddress, IAddressData } from '../value-objects/address/address.types';
import {
  IMemberEntity, IMember, MemberCreateRequest, IMemberMoveRequest,
} from '../value-objects/member';

export interface ISplitHouseholdMembers {
  primaryMember: IMember;
  additionalMembers: IMember[];
}

export interface ISplitHousehold {
  originHouseholdId: string;
  splitMembers: ISplitHouseholdMembers;
}

export interface IHouseholdCreateData {
  primaryBeneficiary: IMemberEntity;
  noFixedHome: boolean;
  homeAddress: IAddressData;
  additionalMembers: IMemberEntity[];
  consentInformation: IConsentInformation;
  id?: uuid;
  registrationNumber?: string;
}

export interface IConsentInformation {
  crcUserName: string;
  registrationLocationId: string;
  registrationMethod: ERegistrationMethod;
  privacyDateTimeConsent: string;
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
