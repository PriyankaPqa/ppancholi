import moment from 'moment';
import VueI18n from 'vue-i18n';
import { IBirthDate } from '../../../entities/value-objects/identity-set/identitySet.types';

export default {
  // Return moment object of a birthdate, with proper index for the month
  getBirthDateMomentObject(birthdate: IBirthDate) {
    const year = birthdate.year as number;
    const month = birthdate.month as number;
    const day = birthdate.day as number;

    return moment({
      year,
      month: typeof month === 'number' ? month - 1 : 0,
      day,
    });
  },

  getBirthDateUTCString(birthdate: IBirthDate) {
    const year = birthdate.year as number;
    const month = birthdate.month as number;
    const day = birthdate.day as number;

    return new Date(Date.UTC(year, +month - 1, day)).toISOString();
  },

  convertBirthDateStringToObject(birthdate: string) {
    const bdayMoment = moment(birthdate).utc();

    return {
      month: bdayMoment.month() + 1,
      day: `${bdayMoment.date()}`,
      year: `${bdayMoment.year()}`,
    };
  },

  getAge(birthDate: IBirthDate) {
    return moment().diff(moment({
      month: (birthDate.month as number) - 1,
      day: (birthDate.day as number),
      year: (birthDate.year as number),
    }), 'years');
  },

  displayBirthDate(birthDate: IBirthDate) {
    if (birthDate.year && birthDate.month && birthDate.day) {
      const birthdate = this.getBirthDateMomentObject(birthDate);
      return birthdate.format('ll');
    }
    return '';
  },

  getBirthDateAndAge(dateOfBirth: string, i18n: VueI18n): string {
    const birthDate: IBirthDate = this.convertBirthDateStringToObject(dateOfBirth);
    if (!birthDate) {
      return '';
    }

    let result = this.displayBirthDate(birthDate);
    result += ` (${this.getAge(birthDate)} ${i18n.t('common.years')})`;
    return result;
  },
};
