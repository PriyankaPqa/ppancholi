import { IMultilingual } from '@libs/shared-lib/types';

import { IAddress, IAddressData } from '../address/address.types';

export enum ECurrentAddressTypes {
    Unknown = 0,
    RemainingInHome = 1,
    Campground = 2,
    FriendsFamily = 3,
    HotelMotel = 4,
    MedicalFacility = 5,
    Other = 6,
    Shelter = 7,
}

export interface IShelterLocationData {
  id?: uuid;
  name: IMultilingual;
  status: number;
  address: IAddressData;
}

export interface ICurrentAddressData {
    addressType: ECurrentAddressTypes;

    placeName?: string;

    placeNumber?: string;

    address?: IAddress;

    shelterLocation?: IShelterLocationData;

    shelterLocationId?: string;

    cRcProvided?: boolean;

    checkIn?: Date;

    checkOut?: Date;
}

export interface ICurrentAddressCreateRequest {
    addressType: ECurrentAddressTypes;

    placeName?: string;

    placeNumber?: string;

    shelterLocationId: uuid;

    address?: IAddressData;

    from: string;
}

export interface ICurrentAddress extends ICurrentAddressData {
    validate(): string[];
    hasPlaceNumber(): boolean;
    hasUnitSuite(): boolean;
    hasStreet(): boolean;
    hasPostalCode(): boolean;
    requiresPlaceName(): boolean;
    requiresCountry(): boolean;
    requiresProvince(): boolean;
    requiresCity(): boolean;
    requiresShelterLocation(): boolean;
    reset(type?: ECurrentAddressTypes, preservePlace?: boolean, country?: string,): void;
}
