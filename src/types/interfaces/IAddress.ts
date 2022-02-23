import { ECanadaProvinces } from '../enums/ECanadaProvinces';

export interface IAddress {
  country?: string;
  streetAddress?: string;
  unitSuite?: string;
  province?: ECanadaProvinces;
  specifiedOtherProvince?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}
