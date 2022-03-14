import VueI18n from 'vue-i18n';
import Vue from 'vue';

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
});
