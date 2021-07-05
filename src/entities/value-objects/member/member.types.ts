import { IIdentitySet, IIdentitySetCreateRequest } from '../identity-set';
import { IContactInformation, IContactInformationCreateRequest } from '../contact-information';
import { ICurrentAddress, ICurrentAddressCreateRequest } from '../current-address/currentAddress.types';
import { IEntity } from '../../base';

export interface IMemberData extends IEntity {
  identitySet: IIdentitySet;

  currentAddress: ICurrentAddress;

  contactInformation: IContactInformation;

  addressHistory: Array<string>;
}

export interface MemberCreateRequest {
  identitySet: IIdentitySetCreateRequest;
  currentAddress: ICurrentAddressCreateRequest;
  contactInformation: IContactInformationCreateRequest;
}

export interface IMember extends IMemberData {
  setCurrentAddress(currentAddress: ICurrentAddress): void;
  validate(skipAgeRestriction?: boolean): string[];
  validateIdentity(skipAgeRestriction: boolean): string[];
  validateCurrentAddress(): string[];
  validateContactInformation(skipEmailPhoneRules: boolean): string[];
}
