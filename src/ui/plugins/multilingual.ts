import Vue from 'vue';
import { IMultilingual } from '@/types';

export default {
  install: (V: typeof Vue) => {
    function multilingual(this: Vue, m: IMultilingual) {
      let { locale } = this.$i18n;

      if (locale !== 'en' && locale !== 'fr') {
        locale = 'en';
      }

      if (m && m.value && m.value[locale]) {
        return m.value[locale];
      }

      return '';
    }

    V.prototype.$m = multilingual;
  },
};
