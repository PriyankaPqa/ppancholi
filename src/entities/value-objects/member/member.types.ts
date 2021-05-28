import { IIdentitySet, IIdentitySetCreateRequest } from '../identity-set';
import { IContactInformation, IContactInformationCreateRequest } from '../contact-information';
import { ICurrentAddress, ICurrentAddressCreateRequest } from '../current-address/currentAddress.types';

export interface IMemberData {
  tenantId: uuid;

  identitySet: IIdentitySet;

  currentAddress: ICurrentAddress;

  contactInformation: IContactInformation;
}

export interface MemberCreateRequest {
  identitySet: IIdentitySetCreateRequest;
  currentAddress: ICurrentAddressCreateRequest;
  contactInformation: IContactInformationCreateRequest;
}

export interface IMember extends IMemberData {
  validate(skipAgeRestriction?: boolean): string[];
  validateIdentity(skipAgeRestriction: boolean): string[];
  validateCurrentAddress(): string[];
  validateContactInformation(skipEmailPhoneRules: boolean): string[];
}
