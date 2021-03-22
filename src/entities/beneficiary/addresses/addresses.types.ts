import { ECanadaProvinces, IEntity } from '@/types';

/**
 * Enums
 */
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

export interface IAddresses extends IEntity {

    noFixedHome: boolean;

    country: string;

    street: string;

    unitSuite?: string;

    provinceTerritory: ECanadaProvinces;

    city: string;

    postalCode: string;

    temporaryAddressType: ETemporaryAddressTypes;

}
