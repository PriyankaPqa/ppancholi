import Vue from 'vue';
import { SUPPORTED_LANGUAGES } from '@/constants/trans';

export default {
  install: (V: typeof Vue) => {
    function formatCurrency(this: Vue, value: number, hideDecimals = false) {
      let { locale } = this.$i18n;

      if (!SUPPORTED_LANGUAGES.includes(locale)) {
        locale = 'en';
      }

      let decimals = 2;

      // Set the number of decimals to 0 if the hideDecimals param is true and the value is a whole number (no decimals)
      if (hideDecimals && value % 1 === 0) {
        decimals = 0;
      }

      return new Intl.NumberFormat(`${locale}-CA`, {
        style: 'currency',
        currency: 'CAD',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    }

    V.prototype.$formatCurrency = formatCurrency;
  },
};
