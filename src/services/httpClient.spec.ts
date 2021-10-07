import { httpClient } from './httpClient';

describe('getFormattedError', () => {
  it('returns the error when meta is null', () => {
    const res = httpClient.getFormattedError({
      status: '409',
      code: 'errors.event-has-been-open-before-so-scheduled-open-date-must-not-change',
      title: 'useless title',
      detail: '',
      meta: null,
    });
    expect(res).toBe('Event has been open before so scheduled open date must not change');
  });

  it('returns the error when meta is string', () => {
    const res = httpClient.getFormattedError({
      status: '409',
      code: 'errors.description-length-more-than-maximum',
      title: 'useless title',
      detail: '',
      meta: { MaxLength: '5' },
    });
    expect(res).toBe('The description length must be 5 or less');
  });

  it('returns the error when meta is multilingual', () => {
    const res = httpClient.getFormattedError({
      status: '409',
      code: 'errors.maximum-number-of-household-members',
      title: 'useless title',
      detail: '',
      meta: { MaximumNumberOfHouseholdMembers: { translation: { en: 'my english text', fr: 'en francais svp' } } },
    });
    expect(res).toBe('The maximum number of household members is my english text');
  });

  it('replaces all instances of the variable in the string', () => {
    const res = httpClient.getFormattedError({
      status: '409',
      code: 'my {param1} is really {param1}, not {param2}',
      title: 'my {param1} is really {param1}, not {param2}',
      detail: '',
      meta: { param1: { translation: { en: 'my english text', fr: 'en francais svp' } }, param2: '123' },
    });
    expect(res).toBe('my my english text is really my english text, not 123');
  });
});
