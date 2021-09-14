import { IEntity, IMultilingual } from '../../../types';

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

export interface ICurrentAddressData {
    addressType: ECurrentAddressTypes;

    placeName?: string;

    placeNumber?: string;

    address?: IAddress;

    shelterLocation?: IShelterLocationData;
}

export interface IShelterLocationData {
    id?: uuid;
    name: IMultilingual;
    status: number;
    address: IAddressData;
}

export interface ICurrentAddressCreateRequest {
    addressType: ECurrentAddressTypes;

    placeName?: string;

    placeNumber?: string;

    shelterLocationId: uuid;

    address?: IAddressData;

    from: string;
}

export interface ICurrentAddress extends ICurrentAddressData, IEntity {
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
