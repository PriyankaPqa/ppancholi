// import { IShelterLocation } from '../../event/event.types';
import { IEntity, IMultilingual } from '../../../types';

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

    shelterLocation?: IShelterLocation;
}

export interface IShelterLocation {
    id?: uuid;
    name: IMultilingual;
    status: number;
    address: IAddressData;
  }

export interface ITemporaryAddressForCreate {
    temporaryAddressType: ETemporaryAddressTypes;

    placeName?: string;

    placeNumber?: string;

    shelterLocationName?: IMultilingual;

    placeAddress?: IAddressData;
}

export interface ITemporaryAddress extends ITemporaryAddressData, IEntity {
    hasPlaceNumber(): boolean;
    hasUnitSuite(): boolean;
    hasStreet(): boolean;
    hasPostalCode(): boolean;
    requiresPlaceName(): boolean;
    requiresCountry(): boolean;
    requiresProvince(): boolean;
    requiresCity(): boolean;
    requiresShelterLocation(): boolean;
    resetTemporaryAddress(type?: ETemporaryAddressTypes): void;
}
