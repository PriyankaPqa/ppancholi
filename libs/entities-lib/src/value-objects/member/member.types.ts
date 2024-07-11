import { IEntity } from '../../base';
import { IIdentitySet, IIdentitySetCreateRequest } from '../identity-set';
import { IContactInformation, IContactInformationCreateRequest } from '../contact-information';
import { ICurrentAddress, ICurrentAddressCreateRequest } from '../current-address/currentAddress.types';

export interface IMemberEntity extends IEntity {
  identitySet: IIdentitySet;

  currentAddress: ICurrentAddress;

  contactInformation: IContactInformation;

  addressHistory: Array<ICurrentAddress>;
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
  currentAddress?: ICurrentAddressCreateRequest;
  identitySet: IIdentitySetCreateRequest;
  sameTemporaryAddressAsPrimary?: boolean;
}

export interface IMember extends IMemberEntity {
  setCurrentAddress(currentAddress: ICurrentAddress): void;
  setIdentity(identitySet: IIdentitySet): void;
  setContactInformation(contactInformation: IContactInformation): void;
  setPersonalInformation(contactInformation: IContactInformation, identitySet: IIdentitySet): void;
  validate(skipAgeRestriction?: boolean): string[];
  validateIdentity(skipAgeRestriction: boolean, isCRCRegistration?: boolean): string[];
  validateCurrentAddress(): string[];
  validateContactInformation(skipEmailPhoneRules: boolean): string[];

  sameTemporaryAddressAsPrimary?: boolean;
}
