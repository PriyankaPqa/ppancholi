import VueI18n from 'vue-i18n';
import { format, differenceInYears, subYears, getYear, getMonth, getDate, parse } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { IBirthDate } from '../../value-objects/identity-set/identitySet.types';

export default {
  parseDateObject(birthdate: IBirthDate) {
    const year = birthdate.year as number;
    const month = birthdate.month as number;
    const day = birthdate.day as number;

    return parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date());
  },

  getBirthDateUTCString(birthdate: IBirthDate) {
    if (!birthdate) {
      return null;
    }
    const year = +birthdate.year;
    const month = +birthdate.month;
    const day = +birthdate.day;

    if (!year || !month || !day) {
      return null;
    }

    try {
      return new Date(Date.UTC(year, month - 1, day)).toISOString();
    } catch (error) {
      return null;
    }
  },

  convertBirthDateStringToObject(birthdate: string) {
    const bdayDateFns = utcToZonedTime(birthdate, 'UTC');

    return {
      month: getMonth(bdayDateFns) + 1,
      day: `${getDate(bdayDateFns)}`,
      year: `${getYear(bdayDateFns)}`,
    };
  },

  getAge(birthDate: IBirthDate) {
    const dateOfBirth = subYears(new Date(
      birthDate.year as number,
      (birthDate.month as number) - 1,
      birthDate.day as number,
    ), 0);
    return differenceInYears(new Date(), dateOfBirth);
  },

  displayBirthDate(birthDate: IBirthDate) {
    if (birthDate.year && birthDate.month && birthDate.day) {
      const birthdate = this.parseDateObject(birthDate);
      return format(birthdate, 'PP');
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
