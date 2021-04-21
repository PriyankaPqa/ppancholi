import { ECanadaProvinces } from '../../../types';
import { IAddress, IAddressData } from './address.types';
import { Address } from './address';

export const mockAddressData = (force?: Partial<IAddressData>): IAddressData => ({
  country: 'CA',
  street: '247 Some Street',
  city: 'Ottawa',
  provinceTerritory: ECanadaProvinces.ON,
  postalCode: 'K1W 1G7',
  geoLocation: { lat: '', lng: '' },
  unitSuite: '',
  ...force,
});

export const mockAddress = (force?: Partial<IAddress>): IAddress => new Address({ ...mockAddressData(), ...force });
