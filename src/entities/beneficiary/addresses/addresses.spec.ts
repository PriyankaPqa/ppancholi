import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { ECanadaProvinces } from '@/types';
import { mockAddressesData } from '@/entities/beneficiary';
import { Addresses } from './addresses';
import { ETemporaryAddressTypes } from './addresses.types';

const longText = 'x'.repeat(MAX_LENGTH_MD + 1);
const longSmallText = 'y'.repeat(MAX_LENGTH_SM + 1);

describe('>>> Addresses', () => {
  describe('>> constructor', () => {
    it('should initialize data if passed', () => {
      const a = new Addresses(mockAddressesData());
      expect(a).toEqual(mockAddressesData());
    });

    it('should reset if not data pass', () => {
      const a = new Addresses();

      expect(a.noFixedHome).toEqual(null);
      expect(a.country).toEqual('CA');
      expect(a.street).toEqual(null);
      expect(a.unitSuite).toEqual(null);
      expect(a.provinceTerritory).toEqual(null);
      expect(a.city).toEqual(null);
      expect(a.postalCode).toEqual(null);
      expect(a.temporaryAddressType).toEqual(null);
      expect(a.geoLocation).toEqual({ lat: null, lng: null });
    });
  });

  describe('>> validation', () => {
    test('country is required', () => {
      const p = new Addresses();
      expect(p.country).toEqual('CA');

      let results = p.validate();
      expect(results).not.toContain('country is required');

      p.noFixedHome = true;
      results = p.validate();
      expect(results).not.toContain('country is required');

      p.noFixedHome = false;
      p.country = 'US';
      results = p.validate();
      expect(results).not.toContain('country is required');
    });

    test('street is required', () => {
      const p = new Addresses();
      let results = p.validate();
      expect(results).toContain('street is required');

      p.noFixedHome = true;
      results = p.validate();
      expect(results).not.toContain('street is required');

      p.noFixedHome = false;
      p.street = '123 MyLane';
      results = p.validate();
      expect(results).not.toContain('street is required');
    });
    test(`street has a max of ${MAX_LENGTH_MD} characters`, () => {
      const p = new Addresses();
      p.street = longText;

      expect(p.validate()).toContain(`street exceeds max length of ${MAX_LENGTH_MD}`);
    });

    test(`unitSuite has a max of ${MAX_LENGTH_SM} characters`, () => {
      const p = new Addresses();
      p.unitSuite = longSmallText;

      expect(p.validate()).toContain(`unitSuite exceeds max length of ${MAX_LENGTH_SM}`);
    });

    test('city is required', () => {
      const p = new Addresses();
      let results = p.validate();
      expect(results).toContain('city is required');

      p.noFixedHome = true;
      results = p.validate();
      expect(results).not.toContain('city is required');

      p.noFixedHome = false;
      p.city = 'Sometown';
      results = p.validate();
      expect(results).not.toContain('city is required');
    });
    test(`city has a max of ${MAX_LENGTH_SM} characters`, () => {
      const p = new Addresses();
      p.city = longSmallText;

      expect(p.validate()).toContain(`city exceeds max length of ${MAX_LENGTH_SM}`);
    });

    test('provinceTerritory is required', () => {
      const p = new Addresses();
      let results = p.validate();
      expect(results).toContain('provinceTerritory is required');

      p.noFixedHome = true;
      results = p.validate();
      expect(results).not.toContain('provinceTerritory is required');

      p.noFixedHome = false;
      p.provinceTerritory = ECanadaProvinces.ON;
      results = p.validate();
      expect(results).not.toContain('provinceTerritory is required');
    });

    test('temporaryAddressType is required', () => {
      const p = new Addresses();
      let results = p.validate();
      expect(results).toContain('temporaryAddressType is required');

      p.noFixedHome = false;
      p.temporaryAddressType = ETemporaryAddressTypes.FriendsFamily;
      results = p.validate();
      expect(results).not.toContain('temporaryAddressType is required');
    });

    test('postalCode is required', () => {
      const p = new Addresses();
      let results = p.validate();
      expect(results).toContain('postalCode is required');

      p.noFixedHome = false;
      p.postalCode = 'Q';
      results = p.validate();
      expect(results).toContain('postalCode is not valid');

      p.country = 'FR';
      p.postalCode = '';
      results = p.validate();
      expect(results).toContain('postalCode is required');
      expect(results).not.toContain('postalCode is not valid');

      p.country = 'CA';
      p.noFixedHome = false;
      p.postalCode = 'K0K 3R0';
      results = p.validate();
      expect(results).not.toContain('postalCode is required');
      expect(results).not.toContain('postalCode is not valid');

      p.noFixedHome = false;
      p.postalCode = 'K0K3R0';
      results = p.validate();
      expect(results).not.toContain('postalCode is required');
      expect(results).not.toContain('postalCode is not valid');
    });
  });
});
