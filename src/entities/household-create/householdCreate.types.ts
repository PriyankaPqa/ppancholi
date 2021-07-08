import { ERegistrationMethod } from '../../types';
import { IAddress, IAddressData } from '../value-objects/address/address.types';
import { IMemberData, IMember, MemberCreateRequest } from '../value-objects/member';

export interface IHouseholdCreateData {
  primaryBeneficiary: IMemberData;
  noFixedHome: boolean;
  homeAddress: IAddressData;
  additionalMembers: IMemberData[];
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

  addAdditionalMember(newPerson: IMember, sameAddress: boolean): void;
  removeAdditionalMember(index: number): void;
  editAdditionalMember(newPerson: IMember, index: number, sameAddress: boolean): void;
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
