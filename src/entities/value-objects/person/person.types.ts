import { ECanadaProvinces, IListOption, IOptionItemData } from '../../../types';
import { ITemporaryAddress, ITemporaryAddressForCreate } from '../temporary-address/temporaryAddress.types';

export interface IBirthDate {
  month?: number | string;
  day?: number | string;
  year?: number | string;
}

export interface IIndigenousIdentityData {
  province: number;
  communityType: number;
  communityName: string;
  id: string;
  status: number;
}

export enum EIndigenousTypes {
  FirstNations = 1,
  InuitCommunity,
  InuitHamlet,
  Metis,
  Other,
}

export interface IPersonData {
  firstName: string;

  middleName: string;

  lastName: string;

  preferredName: string;

  gender: IOptionItemData;

  genderOther: string;

  birthDate: IBirthDate;

  indigenousProvince: ECanadaProvinces;

  indigenousType: EIndigenousTypes;

  indigenousCommunityId: string;

  indigenousCommunityOther: string;

  temporaryAddress: ITemporaryAddress;

  dateOfBirth: string;
}

export interface IPersonForCreate extends Omit<IPersonData, 'gender' | 'temporaryAddress'> {
  gender: IListOption;
  temporaryAddress: ITemporaryAddressForCreate;
}

export interface IPerson extends IPersonData {
  validate(skipAgeRestriction?: boolean): string[];
  validateIdentity(skipAgeRestriction: boolean): string[];
  setIdentity(data: IPersonData): void;
  setIndigenousIdentity(data: IPersonData): void;
}
