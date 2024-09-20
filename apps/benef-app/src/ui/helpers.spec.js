import libHelpers from '@libs/entities-lib/helpers';
import helpers from './helpers';

describe('helpers', () => {
  describe('objectToQueryString', () => {
    it('returns the right query string', () => {
      const params = {
        foo: 'bar',
        lang: 'en',
      };
      expect(helpers.objectToQueryString(params)).toEqual('foo=bar&lang=en');
    });

    it('returns the result of the encodeUrl helper method when the param is registrationLink', () => {
      libHelpers.encodeUrl = jest.fn(() => 'mock-encodedUrl-res');
      const params = {
        lang: 'en',
        registrationLink: 'foo',
      };

      expect(helpers.objectToQueryString(params)).toEqual('lang=en&registrationLink=mock-encodedUrl-res');
    });
  });

  describe('getCurrentDomain', () => {
    it('should return dev tenant if localhost', () => {
      global.window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:8080/en/registration/bc-fire-event/',
          hostname: 'localhost',
        },
      });
      expect(helpers.getCurrentDomain({})).toBe('beneficiary-dev.crc-tech-lab-test.com');
    });

    it('should dev tenant if beneficiary feature branch', () => {
      global.window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://beneficiary-1234.crc-tech-lab-test.com/en/registration/bc-fire-event/',
          hostname: 'beneficiary-1234.crc-tech-lab-test.com',
        },
      });
      expect(helpers.getCurrentDomain({})).toBe('beneficiary-dev.crc-tech-lab-test.com');
    });

    it('should return the tenant if specified in a query params', () => {
      global.window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://beneficiary-1234.crc-tech-lab-test.com/en/registration/bc-fire-event/?force-tenant=forceTenant',
          hostname: 'beneficiary-1234',
        },
      });
      expect(helpers.getCurrentDomain({ query: { 'force-tenant': 'forceTenant' } })).toBe('forceTenant');
    });
  });
});
