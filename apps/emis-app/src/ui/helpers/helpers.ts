import { NavigationGuardNext } from 'vue-router';
import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { IMultilingual } from '@libs/shared-lib/types';
import { i18n } from '@/ui/plugins/i18n';
import { IRestResponse } from '@libs/services-lib/http-client';
import { DateTypes, dateTypes } from '@/constants/dateTypes';
import routes from '@/constants/routes';
import helpers from '@libs/shared-lib/helpers/helpers';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { Trans } from '../plugins';
import { VuePlugin } from '../plugins/features';

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
  enumToTranslatedCollection(myEnum: Record<string, unknown>, translationPath: string, textToValue = false, sort = true) {
    const enumKeys = this.getEnumKeys(myEnum);
    const data = [] as Array<{ value: unknown, text: string, dataTest: string }>;
    enumKeys.forEach((val) => {
      if (textToValue) {
        const text = i18n.t(`${translationPath}.${val}`).toString();
        data.push({ value: text, text, dataTest: val });
      } else {
        const value = myEnum[val];
        data.push({ value, text: i18n.t(`${translationPath}.${val}`).toString(), dataTest: val });
      }
    });
    return sort ? data.sort((a, b) => a.text.localeCompare(b.text)) : data;
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
    if (!array) {
      return array;
    }
    return [...array]
      .sort((a, b) => this.getMultilingualValue(a[key] as unknown as IMultilingual, trim)
        .localeCompare(this.getMultilingualValue(b[key] as unknown as IMultilingual, trim)));
  },

  getLocalStringDate(date: Date | string, dateFieldName: string, formatTo = 'yyyy-MM-dd'): string {
    const dateType = dateTypes.getType(dateFieldName);
    if (!date) {
      return '';
    }
    if (typeof date === 'string' && /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(date)) {
      // here we have been passed a string date already in YYYY-MM-DD = we HAVE to consider it local as it doesnt have time...
      return format(parseISO(date), formatTo);
    }

    if (dateType === DateTypes.ConvertToUtc || dateType === DateTypes.Static) {
      return format(utcToZonedTime(new Date(date), 'UTC'), formatTo);
    }
    return format(new Date(date), formatTo);
  },

  getUtcStringDate(date: Date | string, formatTo = 'YYYY-MM-DD'): string {
    if (!date) {
      return '';
    }
    return format(utcToZonedTime(new Date(date), 'UTC'), formatTo);
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
    return encodeURIComponent(helpers.getNormalizedString(query).replace(/[-[\]{}&~!():*+?./\\,^$|#\s]/g, '\\$&'));
  },

  toQuickSearch(query: string) {
    if (query?.trim()) {
      // any quick search will be treated as a Contains on all searchable fields
      // this splits the search by space and verifies Contains or Equal (like in filters)
      let quickSearch = query.split(' ').filter((x) => x !== '')
        .map((v) => this.sanitize(v))
        .map((v) => `(/.*${v}.*/ OR "\\"${v}\\"")`)
        .join(' AND ');
      quickSearch = `(${quickSearch})`;
      return quickSearch;
    }
    return '';
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

  availableItems<Items extends { level?: string; roles?: string[]; feature?: string, strictLevel?: boolean }>(vue: VuePlugin, items: Items[]): Items[] {
    return items.filter((item) => {
      let levelOrRoleFilter = false;
      let levelCheck = false;
      let rolesCheck = false;
      let featureCheck = true;

      if (item.level) {
        levelOrRoleFilter = true;
        levelCheck = vue.$hasLevel(item.level, item.strictLevel);
      }

      if (item.roles) {
        levelOrRoleFilter = true;
        rolesCheck = item.roles.some((r: string) => vue.$hasRole(r));
      }

      if (item.feature) {
        featureCheck = vue.$hasFeature(item.feature as FeatureKeys);
      }

      return (!levelOrRoleFilter || levelCheck || rolesCheck) && featureCheck;
    });
  },

};
