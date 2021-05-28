import { ECanadaProvinces, IEntity } from '../../../types';

export interface IAddressData {
  country: string;

  streetAddress?: string;

  unitSuite?: string;

  province: ECanadaProvinces;

  specifiedOtherProvince?: string;

  city: string;

  postalCode?: string;

  longitude?: number;

  latitude?: number;

}

export interface IAddress extends IAddressData, IEntity {
  reset(country?: string): void;
}
