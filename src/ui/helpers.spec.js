import helpers from './helpers';

describe('encodeUrl', () => {
  it('returns the right encoded string', () => {
    let url = 'foo.';
    expect(helpers.encodeUrl(url)).toEqual('foo');

    url = 'foo~';
    expect(helpers.encodeUrl(url)).toEqual('foo');

    url = 'foo"';
    expect(helpers.encodeUrl(url)).toEqual('foo');

    url = 'foo bar';
    expect(helpers.encodeUrl(url)).toEqual('foo-bar');

    url = 'foo$';
    expect(helpers.encodeUrl(url)).toEqual('foo%24');

    url = "foo'";
    expect(helpers.encodeUrl(url)).toEqual('foo%27');

    url = 'FoO';
    expect(helpers.encodeUrl(url)).toEqual('foo');
  });
});
