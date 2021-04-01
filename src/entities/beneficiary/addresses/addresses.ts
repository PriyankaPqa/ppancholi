import { ECanadaProvinces } from '@/types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import {
  ETemporaryAddressTypes, IAddresses, IAddressesData, IGeoLocation,
} from './addresses.types';
import { required, maxLengthCheck, isValidCanadianPostalCode } from '../../commonValidation';

export class Addresses implements IAddresses {
  noFixedHome: boolean;

  country: string;

  street: string;

  unitSuite?: string;

  provinceTerritory: ECanadaProvinces;

  city: string;

  postalCode: string;

  temporaryAddressType: ETemporaryAddressTypes;

  geoLocation: IGeoLocation;

  constructor(data?: IAddressesData) {
    if (!data) {
      this.reset();
    } else {
      this.noFixedHome = data.noFixedHome;
      this.country = data.country;
      this.street = data.street;
      this.unitSuite = data.unitSuite;
      this.provinceTerritory = data.provinceTerritory;
      this.city = data.city;
      this.postalCode = data.postalCode;
      this.temporaryAddressType = data.temporaryAddressType;
      this.geoLocation = data.geoLocation;
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.noFixedHome) {
      required(this.country, 'country is required', errors);

      required(this.street, 'street is required', errors);
      maxLengthCheck(this.street, MAX_LENGTH_MD, 'street', errors);

      maxLengthCheck(this.unitSuite, MAX_LENGTH_SM, 'unitSuite', errors);

      required(this.city, 'city is required', errors);
      maxLengthCheck(this.city, MAX_LENGTH_SM, 'city', errors);

      required(this.provinceTerritory, 'provinceTerritory is required', errors);

      required(this.postalCode, 'postalCode is required', errors);

      if (this.country === 'CA') {
        isValidCanadianPostalCode(this.postalCode, 'postalCode is not valid', errors);
      }
    }

    required(this.temporaryAddressType, 'temporaryAddressType is required', errors);

    return errors;
  }

  reset(): void {
    this.noFixedHome = null;
    this.country = 'CA';
    this.street = null;
    this.unitSuite = null;
    this.provinceTerritory = null;
    this.city = null;
    this.postalCode = null;
    this.temporaryAddressType = null;
    this.geoLocation = { lat: null, lng: null };
  }
}
