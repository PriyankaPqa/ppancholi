import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@libs/core-lib/src/constants/validations';
import { ECanadaProvinces } from '@libs/core-lib/types';
import { Address } from './address';
import { mockAddress, mockAddressData } from './address.mock';

const longText = 'x'.repeat(MAX_LENGTH_MD + 1);
const longSmallText = 'y'.repeat(MAX_LENGTH_SM + 1);

describe('>>> Address', () => {
  describe('>> constructor', () => {
    it('should initialize data if passed', () => {
      const a = new Address(mockAddressData());
      expect(a).toEqual(mockAddress());
    });

    it('should call reset reset if not data pass', () => {
      const a = new Address();
      expect(a.country).toEqual('CA');
      expect(a.streetAddress).toEqual(null);
      expect(a.unitSuite).toEqual(null);
      expect(a.province).toEqual(null);
      expect(a.city).toEqual(null);
      expect(a.postalCode).toEqual(null);
      expect(a.latitude).toEqual(0);
      expect(a.longitude).toEqual(0);
    });
  });

  describe('>> validation', () => {
    describe('country', () => {
      it('is required', () => {
        const p = new Address();
        p.country = '';
        const results = p.validate();
        expect(results).toContain('country is required');
      });
    });

    describe('street', () => {
      it('is required', () => {
        const p = new Address();
        const results = p.validate();
        expect(results).toContain('street is required');
      });

      it(`has a max of ${MAX_LENGTH_MD} characters`, () => {
        const p = new Address();
        p.streetAddress = longText;

        expect(p.validate()).toContain(`street exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });

    describe('unitSuite', () => {
      it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
        const p = new Address();
        p.unitSuite = longSmallText;

        expect(p.validate()).toContain(`unitSuite exceeds max length of ${MAX_LENGTH_SM}`);
      });
    });

    describe('city', () => {
      it('is required', () => {
        const p = new Address();
        const results = p.validate();
        expect(results).toContain('city is required');
      });

      it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
        const p = new Address();
        p.city = longSmallText;

        expect(p.validate()).toContain(`city exceeds max length of ${MAX_LENGTH_SM}`);
      });
    });

    describe('province', () => {
      it('is required if is Canada', () => {
        const p = mockAddress();
        p.country = 'CA';
        p.province = null;
        let results = p.validate();
        expect(results).toContain('province is required');

        p.province = ECanadaProvinces.ON;
        results = p.validate();
        expect(results).not.toContain('province is required');
      });

      it('is not required if is not Canada', () => {
        const p = mockAddress();
        p.country = 'AB';
        p.specifiedOtherProvince = 'other province';
        const results = p.validate();
        expect(results).not.toContain('province is required');
      });
    });

    describe('specifiedOtherProvince', () => {
      it('is required if is not Canada', () => {
        const p = mockAddress();
        p.country = 'AB';
        p.specifiedOtherProvince = null;
        let results = p.validate();
        expect(results).toContain('specifiedOtherProvince is required');

        p.specifiedOtherProvince = 'other province';
        results = p.validate();
        expect(results).not.toContain('province is required');
      });

      it('is not required if is Canada', () => {
        const p = mockAddress();
        p.specifiedOtherProvince = null;
        const results = p.validate();
        expect(results).not.toContain('province is required');
      });

      it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
        const p = mockAddress();
        p.country = 'FR';
        p.specifiedOtherProvince = longSmallText;

        expect(p.validate()).toContain(`specifiedOtherProvince exceeds max length of ${MAX_LENGTH_SM}`);
      });
    });

    describe('postalCode', () => {
      it('is required', () => {
        const p = new Address();
        const results = p.validate();
        expect(results).toContain('postalCode is required');
      });

      it('should flag an invalid postalCode if country is Canada', () => {
        const p = new Address();
        p.postalCode = 'Q';
        const results = p.validate();
        expect(results).toContain('postalCode is not valid');
      });

      it('should not flag an valid postalCode if country is Canada', () => {
        const p = new Address();
        p.postalCode = 'K0K3R0';
        const results = p.validate();
        expect(results).not.toContain('postalCode is not valid');
      });

      it('should not flag an invalid postalCode if country is not Canada', () => {
        const p = new Address();
        p.country = 'FR';
        p.postalCode = 'K0K';
        const results = p.validate();
        expect(results).not.toContain('postalCode is not valid');
      });
    });
  });

  describe('Methods', () => {
    describe('reset', () => {
      it('should reset the entity with canada as default', () => {
        const a = mockAddress();
        a.reset();
        expect(a.country).toEqual('CA');
        expect(a.streetAddress).toEqual(null);
        expect(a.unitSuite).toEqual(null);
        expect(a.province).toEqual(null);
        expect(a.city).toEqual(null);
        expect(a.postalCode).toEqual(null);
        expect(a.latitude).toEqual(0);
        expect(a.longitude).toEqual(0);
      });

      it('should reset the entity with given country', () => {
        const a = mockAddress();
        a.reset('FR');
        expect(a.country).toEqual('FR');
        expect(a.streetAddress).toEqual(null);
        expect(a.unitSuite).toEqual(null);
        expect(a.province).toEqual(null);
        expect(a.city).toEqual(null);
        expect(a.postalCode).toEqual(null);
        expect(a.latitude).toEqual(0);
        expect(a.longitude).toEqual(0);
      });
    });
  });
});
