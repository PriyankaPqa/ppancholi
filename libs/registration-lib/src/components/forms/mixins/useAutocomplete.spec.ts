import { Address, mockAddress } from '@libs/entities-lib/value-objects/address';
import { ECanadaProvinces, VForm } from '@libs/shared-lib/types';
import { CurrentAddress, mockCampGround, mockFriendsFamily } from '@libs/entities-lib/value-objects/current-address';
import { useAutocomplete } from './useAutocomplete';

const mockAutocomplete = (country = 'CA') => ({
  country,
  province: 'QC',
  postalCode: 'H2J',
  city: 'Montreal',
  street: 'Peel',
  location: {
    lat: 151,
    lng: 18,
  },
  name: 'place',
});

describe('useAutocomplete', () => {
  describe('resetGeoLocation', () => {
    it('should reset the geo location of an address', () => {
      const { resetGeoLocation } = useAutocomplete();
      const address = mockAddress({ latitude: 10, longitude: 10 });
      resetGeoLocation(address);
      expect(address.longitude).toEqual(0);
      expect(address.latitude).toEqual(0);
    });
  });

  describe('streetAddressAutocomplete', () => {
    it('should set the address fields given the result of an address in Canada', () => {
      const { streetAddressAutocomplete } = useAutocomplete();
      const address = new Address();
      const autocomplete = mockAutocomplete();
      address.unitSuite = '15';
      streetAddressAutocomplete(autocomplete, address);
      expect(address.country).toEqual(autocomplete.country);
      expect(address.province).toEqual(ECanadaProvinces.QC);
      expect(address.specifiedOtherProvince).toEqual(null);
      expect(address.postalCode).toEqual(autocomplete.postalCode);
      expect(address.city).toEqual(autocomplete.city);
      expect(address.streetAddress).toEqual(autocomplete.street);
      expect(address.latitude).toEqual(autocomplete.location.lat);
      expect(address.longitude).toEqual(autocomplete.location.lng);
      expect(address.unitSuite).toEqual(null);
    });

    it('should set the address fields given the result of an address not in Canada', () => {
      const { streetAddressAutocomplete } = useAutocomplete();
      const address = new Address();
      address.unitSuite = '15';
      const autocomplete = mockAutocomplete('FR');

      streetAddressAutocomplete(autocomplete, address);
      expect(address.country).toEqual(autocomplete.country);
      expect(address.province).toEqual(null);
      expect(address.specifiedOtherProvince).toEqual('QC');
      expect(address.postalCode).toEqual(autocomplete.postalCode);
      expect(address.city).toEqual(autocomplete.city);
      expect(address.streetAddress).toEqual(autocomplete.street);
      expect(address.latitude).toEqual(autocomplete.location.lat);
      expect(address.longitude).toEqual(autocomplete.location.lng);
      expect(address.unitSuite).toEqual(null);
    });
  });

  describe('streetCurrentAddressAutocomplete', () => {
    it('should set the address fields given the result of an address in Canada', () => {
      const { streetCurrentAddressAutocomplete } = useAutocomplete();
      const address = new CurrentAddress();
      address.address.unitSuite = '15';
      const autocomplete = mockAutocomplete();

      streetCurrentAddressAutocomplete(mockAutocomplete(), address);
      expect(address.address.country).toEqual(autocomplete.country);
      expect(address.address.province).toEqual(ECanadaProvinces.QC);
      expect(address.address.specifiedOtherProvince).toEqual(null);
      expect(address.address.postalCode).toEqual(autocomplete.postalCode);
      expect(address.address.city).toEqual(autocomplete.city);
      expect(address.address.streetAddress).toEqual(autocomplete.street);
      expect(address.address.latitude).toEqual(autocomplete.location.lat);
      expect(address.address.longitude).toEqual(autocomplete.location.lng);
      expect(address.address.unitSuite).toEqual('15');
    });

    it('should set the address fields given the result of an address not in Canada', () => {
      const { streetCurrentAddressAutocomplete } = useAutocomplete();
      const address = new CurrentAddress();
      address.address.unitSuite = '15';
      const autocomplete = mockAutocomplete('FR');

      streetCurrentAddressAutocomplete(autocomplete, address);
      expect(address.address.country).toEqual(autocomplete.country);
      expect(address.address.province).toEqual(null);
      expect(address.address.specifiedOtherProvince).toEqual('QC');
      expect(address.address.postalCode).toEqual(autocomplete.postalCode);
      expect(address.address.city).toEqual(autocomplete.city);
      expect(address.address.streetAddress).toEqual(autocomplete.street);
      expect(address.address.latitude).toEqual(autocomplete.location.lat);
      expect(address.address.longitude).toEqual(autocomplete.location.lng);
      expect(address.address.unitSuite).toEqual('15');
    });

    it('should set placeName if address requires a place name', () => {
      const { streetCurrentAddressAutocomplete } = useAutocomplete();
      const address = mockCampGround();
      const autocomplete = mockAutocomplete();
      streetCurrentAddressAutocomplete(autocomplete, address);
      expect(address.placeName).toEqual(autocomplete.name);
    });

    it('should reset placeNumber if address has a place number', () => {
      const { streetCurrentAddressAutocomplete } = useAutocomplete();
      const address = mockCampGround({ placeNumber: '123' });
      expect(address.placeNumber).toEqual('123');
      const autocomplete = mockAutocomplete();
      streetCurrentAddressAutocomplete(autocomplete, address);
      expect(address.placeNumber).toEqual(null);
    });

    it('should reset unitSuite if address has a unitSuite', () => {
      const { streetCurrentAddressAutocomplete } = useAutocomplete();
      const address = mockFriendsFamily();
      expect(address.address.unitSuite).toEqual('123');
      const autocomplete = mockAutocomplete();
      streetCurrentAddressAutocomplete(autocomplete, address);
      expect(address.address.unitSuite).toEqual(null);
    });
  });

  describe('onChangeCountry', () => {
    it('should reset the address with proper country and reset the form', () => {
      const { onChangeCountry } = useAutocomplete();
      const address = new Address();
      const refForm = {
        reset: jest.fn(),
      } as unknown as VForm;
      address.reset = jest.fn();

      onChangeCountry('DE', address, refForm);
      expect(address.reset).toHaveBeenCalledWith('DE');
      expect(refForm.reset).toHaveBeenCalled();
    });
  });
});
