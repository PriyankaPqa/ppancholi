/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  searchAndReplace, generateReplaceMap, sanitize932115,
} from '@/utils/owasp';

describe('owasp', () => {
  describe('searchAndReplace', () => {
    it('should recursively replace all characters accordingly to the map in parameters', () => {
      const obj = {
        data: {
          a: 'test',
          b: { b1: 'test' },
          c: [{ c1: 'test' }],
          d: [{ d1: { d11: 'test' } }],
          e: [{ e1: { e11: [{ e111: 'test' }] } }],
          f: ['test', 10],
          g: null as any,
          h: undefined as any,
        },
      };
      const replaceMap = {
        t: 'T',
        s: 'S',
      };

      searchAndReplace(obj, replaceMap);

      expect(obj).toEqual({
        data: {
          a: 'TeST',
          b: { b1: 'TeST' },
          c: [{ c1: 'TeST' }],
          d: [{ d1: { d11: 'TeST' } }],
          e: [{ e1: { e11: [{ e111: 'TeST' }] } }],
          f: ['TeST', 10],
          g: null,
          h: undefined,
        },
      });
    });
  });

  describe('generateReplaceMap', () => {
    it('should generate a replaceMap based on input array without prefix', () => {
      const array = ['dog', 'cat'];
      const replaceBy = 'test';
      const res = generateReplaceMap(array, replaceBy);

      expect(res).toEqual({
        '\n(?=dog)': 'test',
        '\n(?=cat)': 'test',
      });
    });
  });

  describe('sanitize932115', () => {
    it('should sanitize payload for OWASP rule 932115', () => {
      const description = {
        en: 'set up \nset up',
        fr: 'set up \nset up',
      };

      sanitize932115(description);

      expect(description).toEqual({
        en: 'set up set up',
        fr: 'set up set up',
      });
    });
  });
});
