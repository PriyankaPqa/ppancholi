import { ECanadaProvinces, IListOption, IOptionItemData } from '../../../types';

export interface IBirthDate {
  month?: number | string;
  day?: number | string;
  year?: number | string;
}

export interface IIndigenousCommunityData {
  communityType: number;
  communityName: string;
  id: string;
  status: number;
}

export enum EIndigenousTypes {
  FirstNation = 1,
  InuitCommunity,
  InuitHamlet,
  Metis,
  Other,
  Inuit
}

export interface IIndigenousIdentityOption {
  indigenousCommunityId: uuid;
  specifiedOther: string;
}

export interface IIdentitySetCreateRequest{
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: IListOption;
  indigenousIdentity: IIndigenousIdentityOption;
}

export interface IIdentitySetData {
  firstName: string;

  middleName: string;

  lastName: string;

  preferredName: string;

  dateOfBirth: string;

  gender: IOptionItemData;

  genderOther: string;

  birthDate: IBirthDate;

  indigenousProvince: ECanadaProvinces;

  indigenousType: EIndigenousTypes;

  indigenousCommunityId: string;

  indigenousCommunityOther: string;

  indigenousIdentity?: IIndigenousIdentityOption;
}

export interface IIdentitySet extends IIdentitySetData {
  validate(skipAgeRestriction?: boolean): string[];
  setIdentity(data: IIdentitySetData): void;
  setIndigenousIdentity(data: IIdentitySetData): void;
}
