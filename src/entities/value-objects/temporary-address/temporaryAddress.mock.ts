import { ECanadaProvinces } from '@/types';
import { ETemporaryAddressTypes, ITemporaryAddress, ITemporaryAddressData } from './temporaryAddress.types';
import { TemporaryAddress } from './temporaryAddress';

export const mockCampgroundData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.Campground,
  country: 'CA',
  street: '247 Some Street',
  city: 'Ottawa',
  provinceTerritory: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  geoLocation: null,
  placeName: 'test',
  placeNumber: '',
});

export const mockHotelMotelData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.HotelMotel,
  country: 'CA',
  street: '247 Some Street',
  city: 'Ottawa',
  provinceTerritory: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  geoLocation: null,
  placeName: 'test',
  placeNumber: '',
});

export const mockMedicalFacilityTemporaryAddressData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.MedicalFacility,
  country: 'CA',
  street: '247 Some Street',
  city: 'Ottawa',
  provinceTerritory: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  geoLocation: null,
  placeName: 'test',
  placeNumber: '',
});

export const mockFriendsFamilyData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.FriendsFamily,
  country: 'CA',
  street: '',
  city: 'Ottawa',
  provinceTerritory: ECanadaProvinces.ON.toString(),
  postalCode: '',
  geoLocation: null,
});

export const mockOtherData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.Other,
  placeName: 'Other address',
});

export const mockShelterData = (): ITemporaryAddressData => ({
  temporaryAddressType: ETemporaryAddressTypes.Shelter,
  shelterId: 'shelter-guid',
});

export const mockCampGround = (): ITemporaryAddress => new TemporaryAddress(mockCampgroundData());

export const mockHotelMotel = (): ITemporaryAddress => new TemporaryAddress(mockHotelMotelData());

export const mockMedicalFacility = (): ITemporaryAddress => new TemporaryAddress(mockMedicalFacilityTemporaryAddressData());

export const mockFriendsFamily = (): ITemporaryAddress => new TemporaryAddress(mockFriendsFamilyData());

export const mockOther = (): ITemporaryAddress => new TemporaryAddress(mockOtherData());

export const mockShelter = (): ITemporaryAddress => new TemporaryAddress(mockShelterData());
