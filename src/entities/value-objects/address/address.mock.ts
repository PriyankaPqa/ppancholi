import { ECanadaProvinces } from '../../../types';
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
  unitSuite: '',
  ...force,
});

export const mockAddress = (force?: Partial<IAddress>): IAddress => new Address({ ...mockAddressData(), ...force });
