import { ECanadaProvinces } from '@/types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { IAddress, IGeoLocation, IAddressData } from './address.types';
import { required, maxLengthCheck, isValidCanadianPostalCode } from '../../classValidation';

export class Address implements IAddress {
  country?: string;

  street?: string;

  unitSuite?: string;

  provinceTerritory?: ECanadaProvinces | string;

  city?: string;

  postalCode?: string;

  geoLocation?: IGeoLocation;

  constructor(data?: IAddressData) {
    if (!data) {
      this.reset();
    } else {
      this.country = data.country;
      this.street = data.street;
      this.unitSuite = data.unitSuite;
      this.provinceTerritory = data.provinceTerritory;
      this.city = data.city;
      this.postalCode = data.postalCode;
      this.geoLocation = data.geoLocation;
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    required(this.country, 'country is required', errors);

    required(this.street, 'street is required', errors);
    maxLengthCheck(this.street, MAX_LENGTH_MD, 'street', errors);

    if (this.unitSuite) {
      maxLengthCheck(this.unitSuite, MAX_LENGTH_SM, 'unitSuite', errors);
    }

    required(this.city, 'city is required', errors);
    maxLengthCheck(this.city, MAX_LENGTH_SM, 'city', errors);

    required(this.provinceTerritory, 'provinceTerritory is required', errors);
    maxLengthCheck(this.provinceTerritory as string, MAX_LENGTH_SM, 'provinceTerritory', errors);

    required(this.postalCode, 'postalCode is required', errors);

    if (this.country === 'CA' && this.postalCode) {
      isValidCanadianPostalCode(this.postalCode, 'postalCode is not valid', errors);
    }
    return errors;
  }

  reset(country?: string): void {
    this.country = country || 'CA';
    this.street = null;
    this.unitSuite = null;
    this.provinceTerritory = null;
    this.city = null;
    this.postalCode = null;
    this.geoLocation = { lat: null, lng: null };
  }
}
