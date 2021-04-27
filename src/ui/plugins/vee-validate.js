/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import {
  ValidationProvider, extend, ValidationObserver, configure,
} from 'vee-validate';
import moment from '@/ui/plugins/moment';
import PhoneNumber from 'awesome-phonenumber';
import {
  // eslint-disable-next-line camelcase
  required, min, max, email, oneOf, regex, min_value, max_value, numeric,
} from 'vee-validate/dist/rules.umd.min';

import { getBirthDateMomentObject } from '@crctech/registration-lib/src/ui/utils';
import Vue from 'vue';

import { i18n } from './i18n';

// Keep in mind that changing classes' name here will affect any binding done with those ones in the code
// https://logaretm.github.io/vee-validate/guide/validation-provider.html#validation-flags
configure({
  classes: {
    invalid: ['invalid'], // multiple classes
  },
});

extend('numeric', {
  ...numeric,
  message: (_, values) => i18n.t('validations.numeric', values),
});

// Declare only used rules
extend('oneOf', {
  ...oneOf,
  message: (_, values) => i18n.t('validations.oneOf', values),
});

extend('regex', {
  ...regex,
  message: (_, values) => i18n.t('validations.regex', values),
});

extend('required', {
  ...required,
  message: (_, values) => i18n.t('validations.required', values),
});

extend('min', {
  ...min,
  message: (_, values) => i18n.t('validations.min', values),
});

extend('min_value', {
  // eslint-disable-next-line camelcase
  ...min_value,
  message: (_, values) => i18n.t('validations.minValue', { value: values.min }),
});

extend('max_value', {
  // eslint-disable-next-line camelcase
  ...max_value,
  message: (_, values) => i18n.t('validations.maxValue', { value: values.max }),
});

extend('max', {
  ...max,
  message: (_, values) => i18n.t('validations.max', values),
});

extend('email', {
  ...email,
  message: (_, values) => i18n.t('validations.email', values),
});

extend('phone', {
  validate: (phone) => {
    const { number, countryISO2 } = phone;
    if (!number || typeof number !== 'string') {
      return true;
    }

    const pn = new PhoneNumber(number, countryISO2);

    return pn.isValid();
  },
  params: ['phone'],
  message: (_, values) => i18n.t('validations.phone', values),
});

extend('mustBeAfterOrSame', {
  computesRequired: true,
  message: (_, values) => i18n.t('validations.mustBeAfterOrSame', values),
  params: ['X', 'Y'],
  validate: (value, { X, Y }) => {
    const xValid = moment(X, 'YYYY-MM-DD', true).isValid();
    const yValid = moment(Y, 'YYYY-MM-DD', true).isValid();
    if (!xValid || !yValid) return false;
    return moment(X).isSameOrAfter(Y);
  },
});

extend('mustBeBeforeOrSame', {
  computesRequired: true,
  message: (_, values) => i18n.t('validations.mustBeBeforeOrSame', values),
  params: ['X', 'Y'],
  validate: (value, { X, Y }) => {
    const xValid = moment(X, 'YYYY-MM-DD', true).isValid();
    const yValid = moment(Y, 'YYYY-MM-DD', true).isValid();
    if (!xValid || !yValid) return false;
    return moment(X).isSameOrBefore(Y);
  },
});

extend('phoneRequired', {
  validate: ({ number }) => !(!number || typeof number !== 'string'),
  message: (_, values) => i18n.t('validations.required', values),
});

extend('customValidator', {
  params: ['isValid', 'messageKey'],
  message: (_, values) => i18n.t(values.messageKey),
  validate: (value, { isValid }) => isValid,
});

extend('hasPhoneOrEmail', {
  computesRequired: true,
  params: ['hasPhoneOrEmail'],
  validate: (value, { hasPhoneOrEmail }) => hasPhoneOrEmail,
  message: (_, values) => i18n.t('validations.phoneOrEmail', values),
});

extend('canadianPostalCode', {
  message: (_, values) => i18n.t('validations.canadianPostalCode', values),
  validate: (value) => {
    const regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return regex.test(value);
  },
});

extend('birthday', {
  message: (_, values) => i18n.t('registration.personal_info.validations.birthdate', values),
  params: ['birthdate'],
  validate: (value, args) => {
    const { birthdate } = args;

    if (birthdate.year < 0) return false;

    const momentBirthdate = getBirthDateMomentObject(birthdate);
    if (momentBirthdate.isValid()) {
      if (momentBirthdate.isSameOrAfter(moment())) {
        return i18n.t('registration.personal_info.validations.notInFuture');
      }
      return true;
    }
    return false;
  },
});

extend('minimumAge', {
  params: ['birthdate', 'age'],
  validate: (value, args) => {
    const { birthdate, age } = args;

    if (!birthdate.year || !birthdate.month || !birthdate.day) return true;

    const momentBirthdate = getBirthDateMomentObject(birthdate);
    const now = moment().endOf('day');
    now.subtract(age, 'years');

    if (momentBirthdate.isSameOrBefore(now)) {
      return true;
    }

    return i18n.t('registration.personal_info.validations.minimumAge', { x: age });
  },
});

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
