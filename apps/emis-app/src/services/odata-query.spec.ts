/**
 * @group services
 */

import { renderPrimitiveValue } from './odata-query';

describe('renderPrimitiveValue', () => {
  it('generate the proper string for custom filter contains_az', () => {
    const key = 'Name/contains_az';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('search.ismatch(\'query\', \'Name\')');
  });

  it('generate the proper string for custom filter startsWith_az', () => {
    const key = 'Name/startsWith_az';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('search.ismatch(\'query*\', \'Name\')');
  });

  it('generate the proper string for custom filter searchIn_az', () => {
    const key = 'Name/searchIn_az';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('search.in(Name, \'query\', \',\')');
  });

  it('generate the proper string for custom filter notSearchIn_az', () => {
    const key = 'Name/notSearchIn_az';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('not(search.in(Name, \'query\', \',\'))');
  });

  it('generate the proper string for custom filter arrayNotEmpty', () => {
    const key = 'Name/arrayNotEmpty';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('Name/any()');
  });

  it('generate the proper string for custom filter arrayEmpty', () => {
    const key = 'Name/arrayEmpty';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('not(Name/any())');
  });

  // When doing an search in operation on a property represented by an array in Azure Search
  it('generate the proper string for custom filter notSearchInOnArray_az', () => {
    const key = 'Name/notSearchInOnArray_az';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('not(Name/any(x: search.in(x, \'query\', \',\')))');
  });

  // When doing an equal operation on a property represented by an array in Azure Search
  it('generate the proper string for custom filter notEqualOnArray_az', () => {
    const key = 'Name/notEqualOnArray_az';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('not(Name/any(x: x eq \'query\'))');
  });
});
