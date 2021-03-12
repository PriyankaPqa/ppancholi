import { ECanadaProvinces, IEntity, IMultilingual } from '@/types';

/**
 * Enums
 */
export enum EPhoneTypes {
  Mobile = 'Mobile',
  Home = 'Home',
  Other = 'Other',
}

export enum EIndigenousTypes {
  FirstNations = 1,
  InuitCommunity,
  InuitHamlet,
  Metis,
  Other,
}

/**
 * Value objects
 */
export interface IPhoneNumber {
  id?: string;
  number: string;
  phoneNumberType?: EPhoneTypes;
  countryISO2?: string;
  e164Number: string;
}

export interface IOptionItemData {
  id: string;
  name: IMultilingual;
  orderRank: number;
  isOther: boolean;
  isDefault: boolean;
  status?: number;
}

export interface IIndigenousIdentityData {
  provinceTerritory: number;
  communityType: number;
  communityName: string;
  id: string;
  status: number;
}

export interface IBirthDate {
  month?: number;
  day?: number;
  year?: number;
}

/**
 * Interface used for the entity class
 */
export interface IPersonalInformation extends IEntity {
  firstName: string;

  middleName: string;

  lastName: string;

  preferredName: string;

  gender: IOptionItemData;

  genderOther: string;

  birthDate: IBirthDate;

  mobilePhone?: IPhoneNumber;

  homePhone?: IPhoneNumber;

  otherPhone?: IPhoneNumber;

  otherPhoneExtension?: string;

  email: string;

  preferredLanguage: IOptionItemData;

  preferredLanguageOther: string;

  primarySpokenLanguage: IOptionItemData;

  primarySpokenLanguageOther: string;

  indigenousProvince: ECanadaProvinces;

  indigenousType: EIndigenousTypes;

  indigenousCommunityId: string;

  indigenousCommunityOther: string;
}
