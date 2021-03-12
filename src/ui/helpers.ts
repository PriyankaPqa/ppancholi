import { IMultilingual } from '@/types';
import { i18n } from '@/ui/plugins/i18n';

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
      data.push({ value: myEnum[val], text: i18n.t(`${translationPath}.${val}`).toString() });
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

  // eslint-disable-next-line
  filterCollectionByValue(collection: any, string: string) {
    return collection.filter((o: Record<string, unknown>) => Object.keys(o).some((k) => {
      if (typeof o[k] === 'string') {
        return (o[k] as string).toLowerCase().includes(string.toLowerCase());
      }
      return false;
    }));
  },
};
