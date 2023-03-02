import deepmerge from 'deepmerge';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { IAddress, IAddressData } from './address.types';
import { Address } from './address';

export const mockAddressData = (force?: Partial<IAddressData>): IAddressData => ({
  country: 'CA',
  streetAddress: '247 Some Street',
  city: 'Ottawa',
  province: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  latitude: 0,
  longitude: 0,
  unitSuite: '123',
  ...force,
});

export const mockAddress = (force?: Partial<IAddress>): IAddress => new Address(deepmerge(mockAddressData(), force || {}));
