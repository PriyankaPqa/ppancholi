import moment from 'moment';
import { dateTypes } from '@/constants/dateTypes';
import helpers from './helpers';

describe('getLocalStringDate', () => {
  it('returns the date without considering time zone if passed a preformatted date', () => {
    const res = helpers.getLocalStringDate('2010-02-03', dateTypes.static[0], 'YYYY-MM-DD HH:mm');
    expect(res).toBe('2010-02-03 00:00');
  });

  it('returns the date formatted when passed a new Date of a type we want to convert to local', () => {
    const d = new Date();
    let res = helpers.getLocalStringDate(d, dateTypes.convertToLocal[0], 'YYYY-MM-DD HH:mm');
    expect(res).toBe(moment(d).format('YYYY-MM-DD HH:mm'));

    // Entity.created is a timestamp that we always want to display as local - here it is an example of how it would be called normally
    res = helpers.getLocalStringDate(d, 'Entity.created', 'YYYY-MM-DD HH:mm');
    expect(res).toBe(moment(d).format('YYYY-MM-DD HH:mm'));
  });

  it('returns the date considering UTC formatted when passed a static date', () => {
    const d = new Date();
    let res = helpers.getLocalStringDate(d, dateTypes.static[0], 'YYYY-MM-DD HH:mm');
    expect(res).toBe(moment(d).utc().format('YYYY-MM-DD HH:mm'));

    // EventSchedule.scheduledOpenDate is a static date (ie: we've stored as midnight UTC)- here it is an example of how it would be called normally
    res = helpers.getLocalStringDate(new Date('2021-10-01T00:00:00.000Z'), 'EventSchedule.scheduledOpenDate', 'YYYY-MM-DD HH:mm');
    expect(res).toBe('2021-10-01 00:00');
  });
});
