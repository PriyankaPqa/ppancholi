import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { IMultilingual } from '@/types';
import { i18n } from '@/ui/plugins/i18n';
import moment from '@/ui/plugins/moment';

export default {
  // Method to format the backend error messages and display in a toast.
  formatErrorMessages(errorDetailsList: Array<Record<string, unknown>>, errorStatusCode: number) {
    const errorMessageList = errorDetailsList.map((errorDetail) => i18n.t(`error.${errorDetail.messageKey}`, {
      x: errorStatusCode,
      y: errorDetail.errorCode,
    }));
    return errorMessageList.join('</br>');
  },

  // Method to open a window on the right side of the screen
  openWindowRightSide(url: string, width: number) {
    const popupWidth = width;
    const leftPos = window.innerWidth - popupWidth;
    window.open(
      url,
      'helpCenter',
      `directories=no, titlebar=no, toolbar=no, location=no, status=no,
      menubar=no, scrollbars=yes, resizable=yes ,width=${popupWidth}, height=1040, top=0, left=${leftPos}`,
    );
  },

  scrollToFirstError(containerID: string) {
    const containerElement = document.getElementById(containerID);

    if (!containerElement) return;

    const errorElements = containerElement.getElementsByClassName('failed');

    if (errorElements.length > 0) {
      if (containerID === 'app') {
        window.scrollTo({
          top: (errorElements[0] as HTMLElement).offsetTop - 90,
          behavior: 'smooth',
        });
      } else {
        containerElement.scrollTo({
          top: (errorElements[0] as HTMLElement).offsetTop - 90,
          behavior: 'smooth',
        });
      }
    }
  },

  // This function takes a enum in parameters and output a collection with [value: value of enum, text: the translation corresponding to the enum]
  getEnumKeys(myEnum: Record<string, unknown>) {
    // eslint-disable-next-line radix
    return Object.keys(myEnum).filter((x) => !(parseInt(x, 0) >= 0));
  },

  enumToTranslatedCollection(myEnum: Record<string, unknown>, translationPath: string) {
    const enumKeys = this.getEnumKeys(myEnum);
    const data = [] as Array<{value: unknown, text: string}>;
    enumKeys.forEach((val) => {
      const value = myEnum[val];
      data.push({ value, text: i18n.t(`${translationPath}.${val}`).toString() });
    });
    return data.sort((a, b) => a.text.localeCompare(b.text));
  },

  copyToClipBoard(value: string) {
    const el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  },

  getMultilingualValue(m: IMultilingual) {
    let { locale } = i18n;

    if (locale !== 'en' && locale !== 'fr') {
      locale = 'en';
    }

    if (m && m.translation && m.translation[locale]) {
      return m.translation[locale];
    }

    return '';
  },

  sortMultilingualArray<T>(array: Array<T>, key: keyof T) {
    return [...array]
      .sort((a, b) => this.getMultilingualValue(a[key] as unknown as IMultilingual)
        .localeCompare(this.getMultilingualValue(b[key] as unknown as IMultilingual)));
  },

  /**
   * Returns a normalized string value (replaces accents and special characters)
   * Useful for comparing string
   * @param value The string to normalize
   */
  getNormalizedString(value: string) {
    if (!value) {
      return value;
    }

    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Look among an array of object, for an object whose any keys contains the query if searchAll is true
   * Otherwise, it will look for objects whose columns specified in searchAmong contains the query
   * Useful for comparing string
   * @param collection
   * @param query
   * @param searchAll
   * @param searchAmong
   */
  // eslint-disable-next-line
  filterCollectionByValue(collection: any, query: string, searchAll = true, searchAmong: Array<string> = null) {
    return collection.filter((o: Record<string, unknown>) => Object.keys(o).some((k) => {
      if (!searchAll && searchAmong.indexOf(k) === -1) return false;

      if (typeof o[k] === 'string') {
        return (o[k] as string).toLowerCase().includes(query.toLowerCase());
      }
      return false;
    }));
  },

  getStringDate(date: Date| string, format = 'YYYY-MM-DD'): string {
    if (!date) return '';
    return moment(date).utc().format(format);
  },

  /**
   * Fills a translation object (IMultilingual type) with all the existing translations from the i18n json translation files
   * for a given key
   *
   * @param translationKey key for which the translations are used to build the translation object
   * @param hasTranslation false if the translation key doesn't exist in the translation files. In this case, the key will be used as translation
   * @returns translation object
   */
  fillAllTranslationsFromI18n(translationKey: string, hasTranslation = true): IMultilingual {
    const multiLanguageObject: Record<string, string> = {};

    SUPPORTED_LANGUAGES_INFO.forEach((lang) => {
      const locale = lang.key;

      multiLanguageObject[locale] = hasTranslation ? i18n.messages[locale]?.[translationKey] as string : translationKey;
    });

    return { translation: multiLanguageObject };
  },

  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  },
};
