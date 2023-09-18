import birthdate from './birthdate';

describe('getBirthDateUTCString', () => {
  it('returns the date in string if date is valid', () => {
    const b = {
      month: 1,
      day: 23,
      year: 2033,
    };
    expect(birthdate.getBirthDateUTCString(b)).toEqual('2033-01-23T00:00:00.000Z');
  });

  it('returns null if date is invalid', () => {
    const b = {
      month: 1,
      day: 23,
      year: 207657633,
    };
    expect(birthdate.getBirthDateUTCString(b)).toEqual(null);
  });

  it('returns null if date is not fully specified', () => {
    const b = {
      month: null as number,
      day: 23,
      year: 207657633,
    };
    expect(birthdate.getBirthDateUTCString(b)).toEqual(null);
  });
});

describe('parseDateObject', () => {
  it('should correctly parse a birthdate object with all fields present', () => {
    const b = { year: 1990, month: 10, day: 15 };

    const result = birthdate.parseDateObject(b);

    expect(result).toEqual(new Date(1990, 9, 15));
  });
});
