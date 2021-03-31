import { ECanadaProvinces } from '../enums/ECanadaProvinces';

export interface IAddress {
  country: string;
  streetAddress: string;
  unitSuite?: string;
  province: ECanadaProvinces;
  city: string;
  postalCode: string;
  latitude?: string;
  longitude?: string;
}
