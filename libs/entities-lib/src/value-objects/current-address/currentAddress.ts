import _cloneDeep from 'lodash/cloneDeep';
import { utcToZonedTime, format } from 'date-fns-tz';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { isValidCanadianPostalCode, maxLengthCheck, required } from '../../classValidation';
import { Address, IAddress, IAddressData } from '../address';
import { ECurrentAddressTypes, ICurrentAddress, ICurrentAddressCreateRequest, ICurrentAddressData } from './currentAddress.types';
import { IEventGenericLocation } from '../../event';

export class CurrentAddress implements ICurrentAddress {
  addressType: ECurrentAddressTypes;

  placeName?: string;

  placeNumber?: string;

  address?: IAddress;

  shelterLocation?: IEventGenericLocation;

  crcProvided: boolean;

  checkIn: Date | string;

  checkOut: Date | string;

  constructor(data?: ICurrentAddressData) {
    if (!data) {
      this.reset();
    } else {
      this.addressType = data.addressType;
      this.placeName = data.placeName;
      this.placeNumber = data.placeNumber;
      this.address = _cloneDeep(data.address);
      this.shelterLocation = _cloneDeep(data.shelterLocation) || null;
      this.crcProvided = this.hasCrcProvided() ? data.crcProvided === true : null;
      this.checkIn = data.checkIn ? new Date(data.checkIn) : null;
      this.checkOut = data.checkOut ? new Date(data.checkOut) : null;
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

  reset(type?: ECurrentAddressTypes, preservePlace = false, country?: string): void {
    this.addressType = type ?? null;

    if (!preservePlace) {
      this.placeName = '';
      this.placeNumber = '';
    }

    this.address = new Address();
    if (country) {
      this.address.reset(country);
    }
    this.shelterLocation = null;
    this.checkIn = null;
    this.checkOut = null;
    this.crcProvided = this.hasCrcProvided() ? false : null;
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

  hasCrcProvided() {
    const addressTypeHasCrcProvided = [
      ECurrentAddressTypes.Campground,
      ECurrentAddressTypes.HotelMotel,
      ECurrentAddressTypes.MedicalFacility,
      ECurrentAddressTypes.Other,
      ECurrentAddressTypes.Shelter,
    ];
    return addressTypeHasCrcProvided.indexOf(this.addressType) >= 0;
  }

  hasCheckInCheckOut(): boolean {
    const addressTypeHasCheckInCheckOut = [
      ECurrentAddressTypes.Campground,
      ECurrentAddressTypes.FriendsFamily,
      ECurrentAddressTypes.HotelMotel,
      ECurrentAddressTypes.MedicalFacility,
      ECurrentAddressTypes.Other,
      ECurrentAddressTypes.Shelter,
    ];
    return addressTypeHasCheckInCheckOut.indexOf(this.addressType) >= 0;
  }

  public static parseCurrentAddress(currentAddress: ICurrentAddressData): ICurrentAddressCreateRequest {
    if (currentAddress == null) {
      return null;
    }
    const noPlaceAddress = currentAddress.addressType === ECurrentAddressTypes.RemainingInHome
      || currentAddress.addressType === ECurrentAddressTypes.Other
      || currentAddress.addressType === ECurrentAddressTypes.Shelter
      || currentAddress.addressType === ECurrentAddressTypes.Unknown;

    return {
      addressType: currentAddress.addressType,
      placeNumber: currentAddress.placeNumber,
      placeName: currentAddress.placeName,
      shelterLocationId: currentAddress.shelterLocation ? currentAddress.shelterLocation.id : null,
      address: noPlaceAddress ? null : this.parseAddress(currentAddress.address),
      from: format(utcToZonedTime(new Date(), 'UTC'), "yyyy-MM-dd'T'HH:mm:ss'Z'", { timeZone: 'UTC' }),
      crcProvided: currentAddress.crcProvided,
      checkIn: currentAddress.checkIn ? new Date(currentAddress.checkIn).toISOString() : null,
      checkOut: currentAddress.checkOut ? new Date(currentAddress.checkOut).toISOString() : null,
    };
  }

  public static parseAddress(address: IAddressData): IAddressData {
    return {
      country: address.country,
      streetAddress: address.streetAddress,
      unitSuite: address.unitSuite ? address.unitSuite : null,
      province: address.province ?? ECanadaProvinces.OT,
      specifiedOtherProvince: address.specifiedOtherProvince,
      city: address.city,
      postalCode: address.postalCode,
      latitude: address.latitude,
      longitude: address.longitude,
    };
  }
}
