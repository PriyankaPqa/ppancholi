import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../../constants/validations';
import { isValidCanadianPostalCode, maxLengthCheck, required } from '../../classValidation';
import { Address, IAddress } from '../address';
import {
  ECurrentAddressTypes, IShelterLocationData, ICurrentAddress, ICurrentAddressData,
} from './currentAddress.types';

export class CurrentAddress implements ICurrentAddress {
  addressType: ECurrentAddressTypes;

  placeName?: string;

  placeNumber?: string;

  address?: IAddress

  shelterLocation?: IShelterLocationData;

  constructor(data?: ICurrentAddressData) {
    if (!data) {
      this.reset();
    } else {
      this.addressType = data.addressType;
      this.placeName = data.placeName;
      this.placeNumber = data.placeNumber;
      this.address = data.address;
      this.shelterLocation = data.shelterLocation;
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    required(this.addressType, 'addressType is required', errors);

    if (this.requiresPlaceName()) {
      required(this.placeName, 'placeName is required', errors);
      maxLengthCheck(this.placeName, MAX_LENGTH_MD, 'placeName', errors);
    }

    if (this.requiresCountry()) {
      required(this.address.country, 'country is required', errors);
    }

    if (this.hasStreet()) {
      maxLengthCheck(this.address.streetAddress, MAX_LENGTH_MD, 'street', errors);
    }

    if (this.requiresCity()) {
      required(this.address.city, 'city is required', errors);
      maxLengthCheck(this.address.city, MAX_LENGTH_MD, 'city', errors);
    }

    if (this.requiresProvince()) {
      if (this.address.country === 'CA') {
        required(this.address.province, 'province is required', errors);
      } else {
        required(this.address.specifiedOtherProvince, 'specifiedOtherProvince is required', errors);
        maxLengthCheck(this.address.specifiedOtherProvince, MAX_LENGTH_SM, 'specifiedOtherProvince', errors);
      }
    }

    if (this.hasPostalCode()) {
      maxLengthCheck(this.address.postalCode, MAX_LENGTH_SM, 'postalCode', errors);
      if (this.address.country === 'CA') {
        isValidCanadianPostalCode(this.address.postalCode, 'postalCode is not valid', errors);
      }
    }

    if (this.hasPlaceNumber()) {
      maxLengthCheck(this.placeNumber, MAX_LENGTH_SM, 'placeNumber', errors);
    }

    return errors;
  }

  reset(type?: ECurrentAddressTypes): void {
    this.addressType = type ?? null;
    this.placeName = '';
    this.placeNumber = '';
    this.address = new Address();
    this.shelterLocation = null;
  }

  hasPlaceNumber(): boolean {
    return this.addressType === ECurrentAddressTypes.Campground
        || this.addressType === ECurrentAddressTypes.HotelMotel
        || this.addressType === ECurrentAddressTypes.MedicalFacility;
  }

  hasUnitSuite(): boolean {
    return this.addressType === ECurrentAddressTypes.FriendsFamily;
  }

  hasStreet(): boolean {
    return this.hasPlaceNumber() || this.hasUnitSuite();
  }

  hasPostalCode(): boolean {
    return this.hasStreet();
  }

  requiresPlaceName(): boolean {
    return this.addressType === ECurrentAddressTypes.Campground
    || this.addressType === ECurrentAddressTypes.HotelMotel
    || this.addressType === ECurrentAddressTypes.MedicalFacility
    || this.addressType === ECurrentAddressTypes.Other;
  }

  requiresCountry(): boolean {
    return this.addressType === ECurrentAddressTypes.Campground
        || this.addressType === ECurrentAddressTypes.HotelMotel
        || this.addressType === ECurrentAddressTypes.MedicalFacility
        || this.addressType === ECurrentAddressTypes.FriendsFamily;
  }

  requiresProvince(): boolean {
    return this.requiresCountry();
  }

  requiresCity(): boolean {
    return this.requiresCountry();
  }

  requiresShelterLocation(): boolean {
    return this.addressType === ECurrentAddressTypes.Shelter;
  }
}
