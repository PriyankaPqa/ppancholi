import { renderPrimitiveValue } from './odata-query';

describe('renderPrimitiveValue', () => {
  it('generate the proper string for custom filter contains_az', () => {
    const key = 'Name/contains_az';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('search.ismatch(\'query\', \'Name\')');
  });

  it('generate the proper string for custom filter startswith_az', () => {
    const key = 'Name/startswith_az';
    const val = 'query';
    const res = renderPrimitiveValue(key, val);
    expect(res).toBe('search.ismatch(\'query*\', \'Name\')');
  });
});
