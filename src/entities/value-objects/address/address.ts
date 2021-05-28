import { ECanadaProvinces } from '../../../types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../../constants/validations';
import { IAddress, IAddressData } from './address.types';
import { required, maxLengthCheck, isValidCanadianPostalCode } from '../../classValidation';

export class Address implements IAddress {
  country: string;

  streetAddress?: string;

  unitSuite?: string;

  province: ECanadaProvinces;

  specifiedOtherProvince?: string;

  city: string;

  postalCode?: string;

  latitude?: number;

  longitude?: number;

  constructor(data?: IAddressData) {
    if (!data) {
      this.reset();
    } else {
      this.country = data.country;
      this.streetAddress = data.streetAddress;
      this.unitSuite = data.unitSuite;
      this.province = data.province;
      this.specifiedOtherProvince = data.specifiedOtherProvince;
      this.city = data.city;
      this.postalCode = data.postalCode;
      this.latitude = data.latitude;
      this.longitude = data.longitude;
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    required(this.country, 'country is required', errors);

    required(this.streetAddress, 'street is required', errors);
    maxLengthCheck(this.streetAddress, MAX_LENGTH_MD, 'street', errors);

    if (this.unitSuite) {
      maxLengthCheck(this.unitSuite, MAX_LENGTH_SM, 'unitSuite', errors);
    }

    required(this.city, 'city is required', errors);
    maxLengthCheck(this.city, MAX_LENGTH_SM, 'city', errors);

    if (this.country !== 'CA') {
      required(this.specifiedOtherProvince, 'specifiedOtherProvince is required', errors);
      maxLengthCheck(this.specifiedOtherProvince, MAX_LENGTH_SM, 'specifiedOtherProvince', errors);
    } else {
      required(this.province, 'province is required', errors);
    }

    required(this.postalCode, 'postalCode is required', errors);

    if (this.country === 'CA' && this.postalCode) {
      isValidCanadianPostalCode(this.postalCode, 'postalCode is not valid', errors);
    }
    return errors;
  }

  reset(country?: string): void {
    this.country = country || 'CA';
    this.streetAddress = null;
    this.unitSuite = null;
    this.province = null;
    this.specifiedOtherProvince = null;
    this.city = null;
    this.postalCode = null;
    this.latitude = 0;
    this.longitude = 0;
  }
}
