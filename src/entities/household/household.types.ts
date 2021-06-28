import { IPhoneNumber } from '../value-objects/contact-information';
import { IAddressData } from '../value-objects/address';
import { IEntity, IEntityCombined } from '../base';

export interface IHouseholdAddress {
  address?: IAddressData;
  from?: string;
  to?: string;
}

export type Status = 1 | 2;

export interface IHouseholdEntity extends IEntity {
  address?: IHouseholdAddress;
  addressHistory?: Array<IHouseholdAddress>;
  members?: Array<string>;
  primaryBeneficiary?: string;
  registrationNumber?: string;
}
export interface IMemberMetadata {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  homePhoneNumber?: IPhoneNumber;
  mobilePhoneNumber?: IPhoneNumber;
  alternatePhoneNumber?: IPhoneNumber;
}

export interface IHouseholdMetadata extends IEntity {
  memberMetadata: Array<IMemberMetadata>;
  eventIds: Array<uuid>
}

export type IHouseholdCombined = IEntityCombined<IHouseholdEntity, IHouseholdMetadata>
