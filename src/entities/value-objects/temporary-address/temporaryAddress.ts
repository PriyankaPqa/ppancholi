import { isValidCanadianPostalCode, maxLengthCheck, required } from '@/entities/classValidation';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { Address } from '../address';
import { ETemporaryAddressTypes, ITemporaryAddress, ITemporaryAddressData } from './temporaryAddress.types';

export class TemporaryAddress extends Address implements ITemporaryAddress {
  temporaryAddressType: ETemporaryAddressTypes;

  placeName?: string;

  placeNumber?: string;

  shelterId?: uuid;

  constructor(data?: ITemporaryAddressData) {
    super(data);
    if (!data) {
      this.reset();
    } else {
      this.temporaryAddressType = data.temporaryAddressType;
      this.placeName = data.placeName;
      this.placeNumber = data.placeNumber;
      this.shelterId = data.shelterId;
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    required(this.temporaryAddressType, 'temporaryAddressType is required', errors);

    if (this.requiresPlaceName()) {
      required(this.placeName, 'placeName is required', errors);
      maxLengthCheck(this.placeName, MAX_LENGTH_MD, 'placeName', errors);
    }

    if (this.requiresCountry()) {
      required(this.country, 'country is required', errors);
    }

    if (this.hasStreet()) {
      maxLengthCheck(this.street, MAX_LENGTH_MD, 'street', errors);
    }

    if (this.requiresCity()) {
      required(this.city, 'city is required', errors);
      maxLengthCheck(this.city, MAX_LENGTH_MD, 'city', errors);
    }

    if (this.requiresProvinceTerritory()) {
      required(this.provinceTerritory, 'provinceTerritory is required', errors);
    }

    if (this.hasPostalCode()) {
      maxLengthCheck(this.postalCode, MAX_LENGTH_SM, 'postalCode', errors);
      if (this.country === 'CA') {
        isValidCanadianPostalCode(this.postalCode, 'postalCode is not valid', errors);
      }
    }

    if (this.hasPlaceNumber()) {
      maxLengthCheck(this.placeNumber, MAX_LENGTH_SM, 'placeNumber', errors);
    }

    return errors;
  }

  reset(): void {
    super.reset();
    this.temporaryAddressType = null;
    this.placeName = '';
    this.placeNumber = '';
    this.shelterId = '';
  }

  hasPlaceNumber(): boolean {
    return this.temporaryAddressType === ETemporaryAddressTypes.Campground
        || this.temporaryAddressType === ETemporaryAddressTypes.HotelMotel
        || this.temporaryAddressType === ETemporaryAddressTypes.MedicalFacility;
  }

  hasUnitSuite(): boolean {
    return this.temporaryAddressType === ETemporaryAddressTypes.FriendsFamily;
  }

  hasStreet(): boolean {
    return this.hasPlaceNumber() || this.hasUnitSuite();
  }

  hasPostalCode(): boolean {
    return this.hasStreet();
  }

  requiresPlaceName(): boolean {
    return this.temporaryAddressType === ETemporaryAddressTypes.Campground
    || this.temporaryAddressType === ETemporaryAddressTypes.HotelMotel
    || this.temporaryAddressType === ETemporaryAddressTypes.MedicalFacility
    || this.temporaryAddressType === ETemporaryAddressTypes.Other;
  }

  requiresCountry(): boolean {
    return this.temporaryAddressType === ETemporaryAddressTypes.Campground
        || this.temporaryAddressType === ETemporaryAddressTypes.HotelMotel
        || this.temporaryAddressType === ETemporaryAddressTypes.MedicalFacility
        || this.temporaryAddressType === ETemporaryAddressTypes.FriendsFamily;
  }

  requiresProvinceTerritory(): boolean {
    return this.requiresCountry();
  }

  requiresCity(): boolean {
    return this.requiresCountry();
  }

  requiresShelterId(): boolean {
    return this.temporaryAddressType === ETemporaryAddressTypes.Shelter;
  }
}
