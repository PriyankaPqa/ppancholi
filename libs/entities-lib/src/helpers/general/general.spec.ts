import helpers from '../index';

describe('helpers.general', () => {
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

  describe('getValueByPath', () => {
    it('returns correct value', () => {
      const obj = {
        selector: { to: { val: 'val to select' } },
        target: [1, 2, { a: 'test' }],
        root: 'hello',
      };
      expect(helpers.getValueByPath(obj, 'selector.to.val')).toEqual('val to select');
      expect(helpers.getValueByPath(obj, 'target[0]')).toEqual(1);
      expect(helpers.getValueByPath(obj, 'target[2].a')).toEqual('test');
      expect(helpers.getValueByPath(obj, 'root')).toEqual('hello');
    });
  });
});
