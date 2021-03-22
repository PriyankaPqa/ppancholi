import { ECanadaProvinces } from '@/types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { ETemporaryAddressTypes, IAddresses } from './addresses.types';
import { required, maxLengthCheck } from '../../commonValidation';

export class Addresses implements IAddresses {
  noFixedHome: boolean;

  country: string;

  street: string;

  unitSuite?: string;

  provinceTerritory: ECanadaProvinces;

  city: string;

  postalCode: string;

  temporaryAddressType: ETemporaryAddressTypes;

  constructor(data?: unknown) {
    if (!data) {
      this.reset();
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
        this.isValidCanadianPostalCode(this.postalCode, 'postalCode is not valid', errors);
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
  }

  isValidCanadianPostalCode(value: string, errorMsg: string, errors: string[]): void {
    if (!value) return;

    // eslint-disable-next-line
    const regex = /^([a-zA-Z]\d[a-zA-Z]\s?\d[a-zA-Z]\d)$/;
    if (!regex.test(value)) errors.push(errorMsg);
  }
}
