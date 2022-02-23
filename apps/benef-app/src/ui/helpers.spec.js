import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import helpers from './helpers';

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
