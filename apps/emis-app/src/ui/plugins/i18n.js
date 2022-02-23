import VueI18n from 'vue-i18n';
import Vue from 'vue';
import { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE } from '@/constants/trans';
import en from '@/ui/lang/emis/en.json';
import fr from '@/ui/lang/emis/fr.json';
import registrationEn from '@/ui/lang/registration/en.json';
import registrationFr from '@/ui/lang/registration/fr.json';

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: DEFAULT_LANGUAGE, // set locale
  fallbackLocale: FALLBACK_LANGUAGE,
  messages: {
    en: Object.assign(en, registrationEn),
    fr: Object.assign(fr, registrationFr),
  },
});
