import { ECanadaProvinces } from '@/types';
import { ETemporaryAddressTypes, IAddresses } from './addresses.types';

export const mockAddresses = (): IAddresses => ({
  noFixedHome: false,
  country: 'Canada',
  street: '247 Some Street',
  city: 'Ottawa',
  provinceTerritory: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  temporaryAddressType: ETemporaryAddressTypes.Unknown,

  validate: null,
});
