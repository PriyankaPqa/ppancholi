import { IMultilingual } from '../../types/interfaces/IMultilingual';
import { IPhoneNumber } from '../value-objects/contact-information';
import { IAddressData } from '../value-objects/address';
import { IEntity, IEntityCombined } from '../base';

export interface IHouseholdAddress {
  address?: IAddressData;
  from?: string;
  to?: string;
  observation?: string;
}

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

export interface IHouseholdCaseFile {
  eventId: uuid;
  eventName: IMultilingual;
  caseFileId: uuid;
  caseFileNumber: string;
  caseFileStatus: number;
  registeredDate: string | Date;
}

export interface IHouseholdMetadata extends IEntity {
  memberMetadata: Array<IMemberMetadata>;
  eventIds: Array<uuid>;
  caseFiles: IHouseholdCaseFile[];
}

export type IHouseholdCombined = IEntityCombined<IHouseholdEntity, IHouseholdMetadata>
