import _forEach from 'lodash/forEach';
import { i18n } from '@/ui/plugins';
import moment from 'moment';
import { IBirthDate } from './beneficiary/personalInformation/personalInformation.types';

export default {

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  getEnumKeys(myEnum: any) {
    // eslint-disable-next-line radix
    return Object.keys(myEnum).filter((x) => !(parseInt(x, 0) >= 0));
  },

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  enumToTranslatedCollection(myEnum: any, translationPath: string) {
    const enumKeys = this.getEnumKeys(myEnum);
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const data: any[] = [];
    _forEach(enumKeys, (val) => {
      data.push({ value: val, text: i18n.t(`${translationPath}.${val}`) });
    });
    return data.sort((a, b) => a.text.localeCompare(b.text));
  },

  // Return moment object of a birthdate, with proper index for the month
  getBirthDateMomentObject(birthdate: IBirthDate) {
    const { year, month, day } = birthdate;
    return moment({
      year,
      month: typeof month === 'number' ? month - 1 : 0,
      day,
    });
  },
};
