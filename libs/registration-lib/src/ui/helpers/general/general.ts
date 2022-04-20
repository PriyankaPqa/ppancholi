import VueI18n from 'vue-i18n';
import { IMultilingual } from '../../../types';

export default {
  getMultilingualValue(m: IMultilingual, i18n: VueI18n, trim = false) {
    let { locale } = i18n;

    if (locale !== 'en' && locale !== 'fr') {
      locale = 'en';
    }

    if (m && m.translation && m.translation[locale]) {
      return trim ? m.translation[locale].trim() : m.translation[locale];
    }

    return '';
  },

  getEnumKeys(myEnum: Record<string, unknown>) {
    return Object.keys(myEnum).filter((key) => Number.isNaN(Number(key)));
  },

  enumToTranslatedCollection(myEnum: Record<string, unknown>, translationPath: string, i18n: VueI18n = null) {
    const enumKeys = this.getEnumKeys(myEnum);
    const data = [] as Array<{value: unknown; text: string}>;
    enumKeys.forEach((val) => {
      if (i18n) {
        data.push({ value: myEnum[val], text: i18n.t(`${translationPath}.${val}`).toString() });
      } else {
        data.push({ value: myEnum[val], text: `${translationPath}.${val}` });
      }
    });
    return data.sort((a, b) => a.text.localeCompare(b.text));
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

  scrollToFirstError(containerID: string) {
    const containerElement = document.getElementById(containerID);

    if (!containerElement) {
      return;
    }

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

  scrollToFirstErrorDialog(containerId: string) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      return;
    }
    const errorElements = containerElement.getElementsByClassName('failed');
    if (errorElements.length > 0) {
      const scrollContainer = containerElement.parentElement;
      scrollContainer.scrollTo({
        top: (errorElements[0] as HTMLElement).offsetTop - 90,
        behavior: 'smooth',
      });
    }
  },

  /**
   * It encodes a string that contains special characters, in a manner that matches the encoding done in the backend.
   * Used for registration links, which are required to contain special characters
   *
   * @param value String to be encoded
   * @returns Encoded string
   */

  encodeUrl(value: string): string {
    let s = this.getNormalizedString(value);
    s = s.replace(/[.|~|"]/g, '');
    s = s.replace(/[/\s]/g, '-');
    s = encodeURIComponent(s);
    s = s.replace(/[']/g, '%27');
    s = s.toLowerCase();
    return s;
  },

  // eslint-disable-next-line
  filterCollectionByValue(collection: any, query: string, searchAll = true, searchAmong: Array<string> = null) {
    return collection.filter((o: Record<string, unknown>) => Object.keys(o).some((k) => {
      if (!searchAll && searchAmong.indexOf(k) === -1) {
        return false;
      }

      if (typeof o[k] === 'string') {
        return (o[k] as string).toLowerCase().includes(query.toLowerCase());
      }
      return false;
    }));
  },

  // Could be use when one need to wait a fixed amount of time
  timeout(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },
};
