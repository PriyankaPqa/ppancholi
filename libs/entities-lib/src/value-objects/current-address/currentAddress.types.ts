import { IMultilingual } from '@libs/shared-lib/types';
import { IAddress, IAddressData } from '../address/address.types';
import { IEventGenericLocation } from '../../event';

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

export interface IEventGenericLocationWithEventName extends IEventGenericLocation {
    eventName?: IMultilingual;
}

export interface ICurrentAddressData {
    addressType: ECurrentAddressTypes;

    placeName?: string;

    placeNumber?: string;

    address?: IAddress;

    shelterLocation?: IEventGenericLocation;

    shelterLocationId?: string;

    crcProvided?: boolean;

    checkIn?: Date | string;

    checkOut?: Date | string;
}

export interface ICurrentAddressCreateRequest {
    addressType: ECurrentAddressTypes;

    placeName?: string;

    placeNumber?: string;

    shelterLocationId: uuid;

    address?: IAddressData;

    from: string;

    crcProvided: boolean;

    checkIn: Date | string;

    checkOut: Date | string;
}

export interface ICurrentAddress extends ICurrentAddressData {
    validate(): string[];
    hasPlaceNumber(): boolean;
    isBookingRequest(): boolean;
    hasUnitSuite(): boolean;
    hasStreet(): boolean;
    hasPostalCode(): boolean;
    requiresPlaceName(): boolean;
    requiresCountry(): boolean;
    requiresProvince(): boolean;
    requiresCity(): boolean;
    requiresShelterLocation(): boolean;
    reset(type?: ECurrentAddressTypes, preservePlace?: boolean, country?: string,): void;
    hasCrcProvided(): boolean;
    hasCheckInCheckOut(): boolean;
}
