import { ECanadaProvinces, EOptionItemStatus } from '../../../types';
import {
  ETemporaryAddressTypes, ITemporaryAddress, ITemporaryAddressData, ITemporaryAddressForCreate,
} from './temporaryAddress.types';
import { TemporaryAddress } from './temporaryAddress';
import { mockAddressData } from '../address/address.mock';

export const mockCampgroundData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.Campground,
  country: 'CA',
  streetAddress: '247 Some Street',
  city: 'Ottawa',
  province: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  latitude: 0,
  longitude: 0,
  placeName: 'test',
  placeNumber: '',
});

export const mockHotelMotelData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.HotelMotel,
  country: 'CA',
  streetAddress: '247 Some Street',
  city: 'Ottawa',
  province: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  latitude: 0,
  longitude: 0,
  placeName: 'test',
  placeNumber: '',
});

export const mockMedicalFacilityTemporaryAddressData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.MedicalFacility,
  country: 'CA',
  streetAddress: '247 Some Street',
  city: 'Ottawa',
  province: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  latitude: 0,
  longitude: 0,
  placeName: 'test',
  placeNumber: '',
});

export const mockFriendsFamilyData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.FriendsFamily,
  country: 'CA',
  streetAddress: '888 avenue Clark',
  city: 'Ottawa',
  province: ECanadaProvinces.ON,
  postalCode: 'H3L 5G4',
  latitude: 0,
  longitude: 0,
});

export const mockUnknownData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.Unknown,
  country: '',
  streetAddress: '',
  city: '',
  province: null,
  postalCode: '',
  latitude: 0,
  longitude: 0,
});

export const mockRemainingHomeData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.RemainingInHome,
  country: '',
  streetAddress: '',
  city: '',
  province: null,
  postalCode: '',
  latitude: 0,
  longitude: 0,
});

export const mockOtherData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.Other,
  placeName: 'Other address',
  latitude: 0,
  longitude: 0,
});

export const mockShelterData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.Shelter,
  shelterLocation: {
    address: {
      country: 'CA',
      city: 'Gatineau',
      postalCode: 'J8Y 6M3',
      province: ECanadaProvinces.ON,
      streetAddress: '135 Boulevard Saint-Raymond',
    },
    name: {
      translation: {
        en: 'shelter en',
        fr: 'shelter fr',
      },
    },
    status: EOptionItemStatus.Active,
  },
  latitude: 0,
  longitude: 0,
});

export const mockCampGround = (force?: Partial<ITemporaryAddress>): ITemporaryAddress => new TemporaryAddress(
  { ...mockCampgroundData(), ...force },
);

export const mockHotelMotel = (): ITemporaryAddress => new TemporaryAddress(mockHotelMotelData());

export const mockMedicalFacility = (): ITemporaryAddress => new TemporaryAddress(mockMedicalFacilityTemporaryAddressData());

export const mockFriendsFamily = (force?: Partial<ITemporaryAddress>): ITemporaryAddress => new TemporaryAddress(
  { ...mockFriendsFamilyData(), ...force },
);

export const mockOther = (): ITemporaryAddress => new TemporaryAddress(mockOtherData());

export const mockShelter = (): ITemporaryAddress => new TemporaryAddress(mockShelterData());

export const mockUnknown = (): ITemporaryAddress => new TemporaryAddress(mockUnknownData());

export const mockRemainingHome = (): ITemporaryAddress => new TemporaryAddress(mockRemainingHomeData());

export const mockTemporaryAddressForCreate = (): ITemporaryAddressForCreate => ({
  temporaryAddressType: ETemporaryAddressTypes.Campground,
  placeName: 'place name',
  placeNumber: 'place number',
  placeAddress: mockAddressData(),
  shelterLocationName: null,
});
