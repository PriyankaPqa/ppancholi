import { ECanadaProvinces } from '@/types';
import { Addresses } from './addresses';
import { ETemporaryAddressTypes, IAddresses, IAddressesData } from './addresses.types';

export const mockAddressesData = (): IAddressesData => ({
  noFixedHome: false,
  country: 'CA',
  street: '247 Some Street',
  city: 'Ottawa',
  provinceTerritory: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  temporaryAddressType: ETemporaryAddressTypes.Unknown,
  geoLocation: {
    lat: '',
    lng: '',
  },
});

export const mockAddresses = (): IAddresses => new Addresses(mockAddressesData());
