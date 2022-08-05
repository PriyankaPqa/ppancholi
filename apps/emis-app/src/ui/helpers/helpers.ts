import { NavigationGuardNext } from 'vue-router';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { IMultilingual } from '@libs/core-lib/types';
import { i18n } from '@/ui/plugins/i18n';
import moment from '@/ui/plugins/moment';
import { IRestResponse } from '@libs/core-lib/services/http-client';
import { DateTypes, dateTypes } from '@/constants/dateTypes';
import routes from '@/constants/routes';
import { Trans } from '../plugins';

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

  getEnumKeys(myEnum: Record<string, unknown>) {
    // eslint-disable-next-line radix
    return Object.keys(myEnum).filter((x) => !(parseInt(x, 0) >= 0));
  },

  getEnumValues(myEnum: Record<string, unknown>): Array<unknown> {
    // eslint-disable-next-line radix
    return Object.keys(myEnum).filter((x) => !(parseInt(x, 0) >= 0)).map((key) => myEnum[key]);
  },

  // This function takes am enum in parameters and output a collection with [value: value of enum, text: the translation corresponding to the enum]
  enumToTranslatedCollection(myEnum: Record<string, unknown>, translationPath: string, textToValue = false) {
    const enumKeys = this.getEnumKeys(myEnum);
    const data = [] as Array<{ value: unknown, text: string }>;
    enumKeys.forEach((val) => {
      if (textToValue) {
        const text = i18n.t(`${translationPath}.${val}`).toString();
        data.push({ value: text, text });
      } else {
        const value = myEnum[val];
        data.push({ value, text: i18n.t(`${translationPath}.${val}`).toString() });
      }
    });
    return data.sort((a, b) => a.text.localeCompare(b.text));
  },

  copyToClipBoard(value: string) {
    if (document) {
      const el = document.createElement('textarea');
      el.value = value;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      navigator.clipboard.writeText(value);
      document.body.removeChild(el);
    }
  },

  // eslint-disable-next-line
  getMultilingualValue(m: IMultilingual, trim: boolean = false) {
    let { locale } = i18n;

    if (locale !== 'en' && locale !== 'fr') {
      locale = 'en';
    }

    if (m && m.translation && m.translation[locale]) {
      return trim ? m.translation[locale].trim() : m.translation[locale];
    }

    return '';
  },

  // eslint-disable-next-line
  sortMultilingualArray<T>(array: Array<T>, key: keyof T, trim: boolean = false) {
    return [...array]
      .sort((a, b) => this.getMultilingualValue(a[key] as unknown as IMultilingual, trim)
        .localeCompare(this.getMultilingualValue(b[key] as unknown as IMultilingual, trim)));
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
  filterCollectionByValue(collection: Array<any>, query: string, searchAll = true, searchAmong: Array<string> = null, deepSearch = false) {
    if (query == null || query === '') {
      return collection;
    }
    return collection.filter((o: Record<string, unknown>) => {
      const flat = deepSearch ? this.flattenObj(o) : o;
      return Object.keys(flat).some((k) => {
        if (!searchAll && searchAmong.indexOf(k) === -1) {
          return false;
        }

        if (typeof flat[k] === 'string') {
          return (flat[k] as string).toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
    });
  },

  flattenObj(obj: Record<string, unknown>, parent?: string, res: Record<string, unknown> = {}): Record<string, unknown> {
    Object.keys(obj).forEach((key) => {
      // eslint-disable-next-line
      const propName = parent ? parent + '.' + key : key;
      if (obj[key] !== null && typeof obj[key] === 'object') {
        this.flattenObj(obj[key] as Record<string, unknown>, propName, res);
      } else {
        res[propName] = obj[key];
      }
    });
    return res;
  },

  getLocalStringDate(date: Date | string, dateFieldName: string, format = 'YYYY-MM-DD'): string {
    const dateType = dateTypes.getType(dateFieldName);
    if (!date) {
      return '';
    }
    if (typeof date === 'string' && /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(date)) {
      // here we have been passed a string date already in YYYY-MM-DD = we HAVE to consider it local as it doesnt have time...
      return moment(date).format(format);
    }

    if (dateType === DateTypes.ConvertToUtc || dateType === DateTypes.Static) {
      return moment(date).utc().format(format);
    }
    return moment(date).format(format);
  },

  getUtcStringDate(date: Date | string, format = 'YYYY-MM-DD'): string {
    if (!date) {
      return '';
    }
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

  formatBytes(bytes: number, decimals = 2, mode = 'bits') {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = mode === 'bits' ? 1000 : 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
  },

  downloadFile(response: IRestResponse<string | BlobPart>, forceFileName?: string) {
    let fileName = '';

    if (forceFileName) {
      fileName = forceFileName;
    } else if (response.headers['content-disposition']) {
      fileName = this.getFileNameStringFromContentDisposition(response.headers['content-disposition']);
    }
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    this.downloadBlob(blob, fileName);
  },

  downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    a.remove();
  },

  getFileName(disposition: string) {
    const name = this.getFileNameStringFromContentDisposition(disposition).split('.');
    return name.slice(0, name.length - 1).join('.');
  },

  getExtension(disposition: string) {
    const name = this.getFileNameStringFromContentDisposition(disposition).split('.');
    return name[name.length - 1];
  },

  getFileNameStringFromContentDisposition(disposition: string): string {
    const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-.]+)(?:; ?|$)/;
    const asciiFilenameRegex = /filename=(["']?)(.*?[^\\])\1(?:; ?|$)/;

    let fileName: string = null;
    if (utf8FilenameRegex.test(disposition)) {
      fileName = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1]);
    } else {
      const matches = asciiFilenameRegex.exec(disposition);
      if (matches != null && matches[2]) {
        fileName = matches[2];
      }
    }
    return fileName;
  },

  async confirmBeforeLeaving(vue: Vue, hasChanged: boolean, next: NavigationGuardNext = null) {
    let leavingConfirmed = true;
    if (hasChanged) {
      leavingConfirmed = await vue.$confirm({
        title: vue.$t('confirmLeaveDialog.title'),
        messages: [
          vue.$t('confirmLeaveDialog.message_1'),
          vue.$t('confirmLeaveDialog.message_2'),
        ],
      });
    }
    if (next && leavingConfirmed) {
      next();
    }
    return leavingConfirmed;
  },

  // Could be use when one need to wait a fixed amount of time
  timeout(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  // https://docs.microsoft.com/en-us/azure/search/query-lucene-syntax?redirectedfrom=MSDN#escaping-special-characters
  // https://docs.microsoft.com/en-us/azure/search/query-lucene-syntax?redirectedfrom=MSDN#encoding-unsafe-and-reserved-characters-in-urls

  // Used for search query in Azure search. Only the input query needs to be sanitize.
  sanitize(query: string) {
    return encodeURIComponent(query.replace(/[-[\]{}&~!():*+?./\\,^$|#\s]/g, '\\$&'));
  },

  decodeJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  },

  redirectToLoginErrorPage() {
    const locale = Trans.getUserLang()?.langNoISO ?? i18n.locale;
    window.location.href = `${window.location.origin}/${locale}/${routes.loginError.path}`;
  },

};
