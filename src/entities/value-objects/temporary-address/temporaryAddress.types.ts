import { IEntity } from '@/types';

import { IAddressData } from '../address/address.types';

export enum ETemporaryAddressTypes {
    Unknown = 0,
    RemainingInHome = 1,
    Campground = 2,
    FriendsFamily = 3,
    HotelMotel = 4,
    MedicalFacility = 5,
    Other = 6,
    Shelter = 7,
}

export interface ITemporaryAddressData extends IAddressData {
    temporaryAddressType: ETemporaryAddressTypes;

    placeName?: string;

    placeNumber?: string;

    shelterId?: uuid;
}

export interface ITemporaryAddress extends ITemporaryAddressData, IEntity {
    resetAddress(): void;
    hasPlaceNumber(): boolean;
    hasUnitSuite(): boolean;
    hasStreet(): boolean;
    hasPostalCode(): boolean;
    requiresPlaceName(): boolean;
    requiresCountry(): boolean;
    requiresProvinceTerritory(): boolean;
    requiresCity(): boolean;
    requiresShelterId(): boolean;
}
