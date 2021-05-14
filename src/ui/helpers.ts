import helpers from '@crctech/registration-lib/src/ui/helpers';

import { i18n } from './plugins/i18n';

export default {
  enumToTranslatedCollection(myEnum: Record<string, unknown>, translationPath: string) {
    return helpers.enumToTranslatedCollection(myEnum, translationPath, i18n);
  },

  scrollToFirstErrorDialog(containerId: string) {
    return helpers.scrollToFirstErrorDialog(containerId);
  },

  /**
   * Transforms a query params object into a query string. If the param is registrationLink, it passes the value through a method that
   * encodes it in a custom way, to match the encoding done in the backend on special characters
   *
   * @param obj Query parameters that will be transformed into query string
   * @returns query string
   */

  objectToQueryString(obj :Record<string, string>): string {
    return Object.keys(obj).map((k) => `${encodeURIComponent(k)}=${k === 'registrationLink'
      ? helpers.encodeUrl(obj[k])
      : encodeURIComponent(obj[k])}`)
      .join('&');
  },
};
