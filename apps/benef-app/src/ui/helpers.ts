import helpers from '@libs/entities-lib/helpers';
import { Route } from 'vue-router';

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

  openHelpCenterWindow(url: string, width = 500) {
    const popupWidth = width;
    const leftPos = window.innerWidth - popupWidth;
    window.open(
      url,
      'helpCenter',
      `directories=no, titlebar=no, toolbar=no, location=no, status=no,
      menubar=no, scrollbars=yes, resizable=yes ,width=${popupWidth}, height=1040, top=0, left=${leftPos}`,
    );
  },

  getCurrentDomain($route: Route) : string {
    // Used for test automation in feature branch
    if ($route.query) {
      const forceTenant = $route.query['force-tenant'] as string;
      if (forceTenant) {
        return forceTenant;
      }
    }

    let d = window.location.hostname;
    if (d.startsWith('localhost') || (/beneficiary-\d+\.crc-tech\.ca/i).test(d)) {
      d = 'beneficiary-dev.crc-tech-lab-test.com';
    }
    return d;
  },
};
