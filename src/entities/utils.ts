import { i18n } from '@/ui/plugins';
import moment from 'moment';
import { IBirthDate } from './value-objects/person/person.types';

export default {

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  getEnumKeys(myEnum: any) {
    // eslint-disable-next-line radix
    return Object.keys(myEnum).filter((x) => !(parseInt(x, 0) >= 0));
  },

  enumToTranslatedCollection(myEnum: Record<string, unknown>, translationPath: string) {
    const enumKeys = this.getEnumKeys(myEnum);
    const data = [] as Array<{value: unknown, text: string}>;
    enumKeys.forEach((val) => {
      data.push({ value: myEnum[val], text: i18n.t(`${translationPath}.${val}`).toString() });
    });
    return data.sort((a, b) => a.text.localeCompare(b.text));
  },

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

  isValidCanadianPostalCode(value: string, errorMsg: string, errors: string[]): void {
    if (!value) return;

    // eslint-disable-next-line
    const regex = /^([a-zA-Z]\d[a-zA-Z]\s?\d[a-zA-Z]\d)$/;
    if (!regex.test(value)) errors.push(errorMsg);
  },
};
