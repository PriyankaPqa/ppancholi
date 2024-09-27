import deepmerge from 'deepmerge';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import {
  ECurrentAddressTypes, ICurrentAddress, ICurrentAddressData, ICurrentAddressCreateRequest,
} from './currentAddress.types';
import { CurrentAddress } from './currentAddress';
import { mockAddress, mockAddressData } from '../address/address.mock';
import { EEventLocationStatus } from '../../event';

export const mockCampgroundData = (): ICurrentAddressData => ({
  addressType: ECurrentAddressTypes.Campground,
  address: mockAddress(),
  placeName: 'test',
  placeNumber: '',
  checkIn: '2023-05-01T00:00:00.000Z',
  checkOut: '2023-05-31T00:00:00.000Z',
  crcProvided: null,
});

export const mockHotelMotelData = (): ICurrentAddressData => ({
  addressType: ECurrentAddressTypes.HotelMotel,
  address: mockAddress(),
  placeName: 'test',
  placeNumber: '',
});

export const mockMedicalFacilityCurrentAddressData = (): ICurrentAddressData => ({
  addressType: ECurrentAddressTypes.MedicalFacility,
  address: mockAddress(),
  placeName: 'test',
  placeNumber: '',
});

export const mockFriendsFamilyData = (): ICurrentAddressData => ({
  addressType: ECurrentAddressTypes.FriendsFamily,
  address: mockAddress(),
});

export const mockUnknownData = (): ICurrentAddressData => ({
  addressType: ECurrentAddressTypes.Unknown,
  address: mockAddress(),
});

export const mockRemainingHomeData = (): ICurrentAddressData => ({
  addressType: ECurrentAddressTypes.RemainingInHome,
  address: mockAddress(),
});

export const mockOtherData = (): ICurrentAddressData => ({
  addressType: ECurrentAddressTypes.Other,
  placeName: 'Other address',
  address: mockAddress(),
});

export const mockShelterData = (): ICurrentAddressData => ({
  addressType: ECurrentAddressTypes.Shelter,
  address: mockAddress(),
  shelterLocation: {
    id: 'shelterLocId',
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
    status: EEventLocationStatus.Active,
  },
});

export const mockCampGround = (force?: Partial<ICurrentAddress>): ICurrentAddress => new CurrentAddress(
  deepmerge(mockCampgroundData(), force || {}),
);

export const mockHotelMotel = (): ICurrentAddress => new CurrentAddress(mockHotelMotelData());

export const mockMedicalFacility = (): ICurrentAddress => new CurrentAddress(mockMedicalFacilityCurrentAddressData());

export const mockFriendsFamily = (force?: Partial<ICurrentAddress>): ICurrentAddress => new CurrentAddress(
  deepmerge(mockFriendsFamilyData(), force || {}),
);

export const mockOther = (): ICurrentAddress => new CurrentAddress(mockOtherData());

export const mockShelter = (): ICurrentAddress => new CurrentAddress(mockShelterData());

export const mockUnknown = (): ICurrentAddress => new CurrentAddress(mockUnknownData());

export const mockRemainingHome = (): ICurrentAddress => new CurrentAddress(mockRemainingHomeData());

export const mockCurrentAddressCreateRequest = (): ICurrentAddressCreateRequest => ({
  addressType: ECurrentAddressTypes.Campground,
  placeName: 'place name',
  placeNumber: 'place number',
  address: mockAddressData(),
  shelterLocationId: null,
  from: '2021-05-27T16:47:32Z',
  checkIn: '2021-05-27T00:00:00.000Z',
  checkOut: '2021-05-27T00:00:00.000Z',
  crcProvided: true,

});
