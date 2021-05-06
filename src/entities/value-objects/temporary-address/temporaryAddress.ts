import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../../constants/validations';
import { isValidCanadianPostalCode, maxLengthCheck, required } from '../../classValidation';
import { Address } from '../address';
import {
  ETemporaryAddressTypes, IShelterLocation, ITemporaryAddress, ITemporaryAddressData,
} from './temporaryAddress.types';

export class TemporaryAddress extends Address implements ITemporaryAddress {
  temporaryAddressType: ETemporaryAddressTypes;

  placeName?: string;

  placeNumber?: string;

  shelterLocation?: IShelterLocation;

  latitude: number;

  longitude: number;

  constructor(data?: ITemporaryAddressData) {
    super(data);
    if (!data) {
      this.resetTemporaryAddress();
    } else {
      this.temporaryAddressType = data.temporaryAddressType;
      this.placeName = data.placeName;
      this.placeNumber = data.placeNumber;
      this.shelterLocation = data.shelterLocation;
      this.latitude = data.latitude;
      this.longitude = data.longitude;
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
      maxLengthCheck(this.streetAddress, MAX_LENGTH_MD, 'street', errors);
    }

    if (this.requiresCity()) {
      required(this.city, 'city is required', errors);
      maxLengthCheck(this.city, MAX_LENGTH_MD, 'city', errors);
    }

    if (this.requiresProvince()) {
      if (this.country === 'CA') {
        required(this.province, 'province is required', errors);
      } else {
        required(this.specifiedOtherProvince, 'specifiedOtherProvince is required', errors);
        maxLengthCheck(this.specifiedOtherProvince, MAX_LENGTH_SM, 'specifiedOtherProvince', errors);
      }
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

  resetTemporaryAddress(type?: ETemporaryAddressTypes): void {
    super.reset();
    this.temporaryAddressType = type ?? null;
    this.placeName = '';
    this.placeNumber = '';
    this.shelterLocation = null;
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

  requiresProvince(): boolean {
    return this.requiresCountry();
  }

  requiresCity(): boolean {
    return this.requiresCountry();
  }

  requiresShelterLocation(): boolean {
    return this.temporaryAddressType === ETemporaryAddressTypes.Shelter;
  }
}
