import moment from 'moment';
import VueI18n from 'vue-i18n';
import { IBirthDate } from '../entities/value-objects/person/person.types';

/* eslint-disable  @typescript-eslint/no-explicit-any */ // eslint-disable-next-line radix
export const getEnumKeys = (myEnum: any) => Object.keys(myEnum).filter((x) => !(parseInt(x, 0) >= 0));

export const enumToTranslatedCollection = (myEnum: Record<string, unknown>, translationPath: string, i18n: VueI18n = null) => {
  const enumKeys = getEnumKeys(myEnum);
  const data = [] as Array<{value: unknown; text: string}>;
  enumKeys.forEach((val) => {
    if (i18n) {
      data.push({ value: myEnum[val], text: i18n.t(`${translationPath}.${val}`).toString() });
    } else {
      data.push({ value: myEnum[val], text: `${translationPath}.${val}` });
    }
  });
  return data.sort((a, b) => a.text.localeCompare(b.text));
};

// Return moment object of a birthdate, with proper index for the month
export const getBirthDateMomentObject = (birthdate: IBirthDate) => {
  const year = birthdate.year as number;
  const month = birthdate.month as number;
  const day = birthdate.day as number;

  return moment({
    year,
    month: typeof month === 'number' ? month - 1 : 0,
    day,
  });
};

export const isValidCanadianPostalCode = (value: string, errorMsg: string, errors: string[]): void => {
  if (!value) return;

  // eslint-disable-next-line
    const regex = /^([a-zA-Z]\d[a-zA-Z]\s?\d[a-zA-Z]\d)$/;
  if (!regex.test(value)) errors.push(errorMsg);
};

export const getAge = (birthDate: IBirthDate) => moment().diff(moment({
  month: (birthDate.month as number) - 1,
  day: (birthDate.day as number),
  year: (birthDate.year as number),
}), 'years');

export const displayBirthDate = (birthDate: IBirthDate) => {
  if (birthDate.year && birthDate.month && birthDate.day) {
    const birthdate = getBirthDateMomentObject(birthDate);
    return birthdate.format('ll');
  }
  return '';
};
