import VueI18n from 'vue-i18n';
import { IMultilingual } from '@libs/shared-lib/types';
import helpers from '@libs/shared-lib/helpers/helpers';

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
    const data = [] as Array<{ value: unknown; text: string, dataTest: string }>;
    enumKeys.forEach((val) => {
      if (i18n) {
        data.push({ value: myEnum[val], text: i18n.t(`${translationPath}.${val}`).toString(), dataTest: val });
      } else {
        data.push({ value: myEnum[val], text: `${translationPath}.${val}`, dataTest: val });
      }
    });
    return data.sort((a, b) => a.text.localeCompare(b.text));
  },

  scrollToFirstError(containerID: string) {
    const containerElement = document.getElementById(containerID);

    if (!containerElement) {
      return;
    }

    const errorElements = containerElement.querySelectorAll('.failed, .error--text');

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
    const errorElements = containerElement.querySelectorAll('.failed, .error--text');
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
    let s = helpers.getNormalizedString(value);
    s = s.replace(/[.|~|"]/g, '');
    s = s.replace(/[/\s]/g, '-');
    s = encodeURIComponent(s);
    s = s.replace(/[']/g, '%27');
    s = s.toLowerCase();
    return s;
  },

  // Could be use when one need to wait a fixed amount of time
  timeout(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  // eslint-disable-next-line
  getValueByPath(from: any, selector: string) {
    return selector
      .replace(/\[([^[\]]*)\]/g, '.$1.')
      .split('.')
      .filter((t) => t !== '')
      .reduce((prev, cur) => prev && prev[cur], from);
  },

};
