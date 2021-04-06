import { ECanadaProvinces, IEntity } from '@/types';

export interface IGeoLocation {
    lat: string,
    lng: string,
}

export interface IAddressData {
    country?: string;

    street?: string;

    unitSuite?: string;

    provinceTerritory?: ECanadaProvinces | string;

    city?: string;

    postalCode?: string;

    geoLocation?: IGeoLocation;

}

export interface IAddress extends IAddressData, IEntity {
    resetAddress(): void;
}
