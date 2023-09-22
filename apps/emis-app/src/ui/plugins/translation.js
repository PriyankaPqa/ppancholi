import { localeChanged } from 'vee-validate';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/constants/trans';
import { i18n } from '@/ui/plugins/i18n';
import { httpClient } from '@/services/httpClient';
import vuetify from '@libs/shared-lib/plugins/vuetify/vuetify';

import { fr, enCA } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';

const Trans = {
  get defaultLanguage() {
    return DEFAULT_LANGUAGE;
  },
  get supportedLanguages() {
    return SUPPORTED_LANGUAGES;
  },
  get currentLanguage() {
    return i18n.locale;
  },
  set currentLanguage(lang) {
    i18n.locale = lang;
    const dateFnsMap = {
      fr,
      en: enCA,
    };
    setDefaultOptions({ locale: dateFnsMap[lang] });
  },
  /**
   * Gets the first supported language that matches the user's
   * @return {String}
   */
  getUserSupportedLang() {
    const userPreferredLang = Trans.getUserLang();

    // Check if user preferred browser lang is supported
    if (Trans.isLangSupported(userPreferredLang.lang)) {
      return userPreferredLang.lang;
    }
    // Check if user preferred lang without the ISO is supported
    if (Trans.isLangSupported(userPreferredLang.langNoISO)) {
      return userPreferredLang.langNoISO;
    }
    return Trans.defaultLanguage;
  },
  /**
   * Returns the users preferred language
   */
  getUserLang() {
    const lang = window.navigator.language || window.navigator.userLanguage || Trans.defaultLanguage;
    return {
      lang,
      langNoISO: lang.split('-')[0],
    };
  },
  /**
   * Sets the language to various services (axios, the html tag etc)
   * @param {String} lang
   * @return {String} lang
   */
  setI18nLanguageInServices(lang) {
    Trans.currentLanguage = lang;
    httpClient.setHeadersLanguage(lang);
    document.querySelector('html').setAttribute('lang', lang);
    vuetify.framework.lang.current = lang;
    localeChanged();
    return lang;
  },
  /**
   * Loads new translation messages and changes the language when finished
   * @param lang
   * @return {Promise<any>}
   */
  changeLanguage(lang) {
    if (!Trans.isLangSupported(lang)) {
      return Promise.reject(new Error('Language not supported'));
    }
    if (i18n.locale === lang) {
      return Promise.resolve(lang);
    } // has been loaded prior
    return Trans.loadLanguageFile(lang).then((msgs) => {
      i18n.setLocaleMessage(lang, msgs.default || msgs);
      return Trans.setI18nLanguageInServices(lang);
    });
  },
  /**
   * Async loads a translation file
   * @param lang
   * @return {Promise<*>|*}
   */
  loadLanguageFile(lang) {
    return import(`@/ui/lang/emis/${lang}.json`);
  },
  /**
   * Checks if a lang is supported
   * @param {String} lang
   * @return {boolean}
   */
  isLangSupported(lang) {
    return Trans.supportedLanguages.includes(lang);
  },
  /**
   * Checks if the route's param is supported, if not, redirects to the first supported one.
   * @param {Route} to
   * @param {Route} from
   * @param {Function} next
   * @return {*}
   */
  routeMiddleware(to, from, next) {
    // Load async message files here
    const { lang } = to.params;
    if (!Trans.isLangSupported(lang)) {
      return next(Trans.getUserSupportedLang());
    }
    return Trans.changeLanguage(lang).then(() => next());
  },
  /**
   * Returns a new route object that has the current language already defined
   * To be used on pages and components, outside of the main \ route, like on Headers and Footers.
   * @example <router-link :to="$i18nRoute({ name: 'someRoute'})">Click Me </router-link>
   * @param {Object} to - route object to construct
   */
  i18nRoute(to) {
    return {
      ...to,
      params: { lang: this.currentLanguage, ...to.params },
    };
  },
};

export { Trans };
