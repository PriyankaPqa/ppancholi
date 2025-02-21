/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import {
  ValidationProvider, extend, ValidationObserver, configure,
} from 'vee-validate';
import { parsePhoneNumber } from 'awesome-phonenumber';
import { isValid as isValidDate, isSameDay, isAfter, startOfDay, endOfDay, subYears, isBefore } from 'date-fns';
import {
  required, min, max, email, regex, min_value, max_value, numeric, oneOf,
} from 'vee-validate/dist/rules.umd.min';
import Vue from 'vue';
import helpers from '@libs/entities-lib/helpers';
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

extend('regex', {
  ...regex,
  message: (_, values) => i18n.t('validations.regex', values),
});

extend('required', {
  ...required,
  message: (_, values) => i18n.t('validations.required', values),
});

extend('requiredCheckbox', {
  ...required,
  message: (_, values) => i18n.t('validations.required', values),
});

extend('min', {
  ...min,
  message: (_, values) => i18n.t('validations.min', { value: values.length }),
});
extend('min_value', {
  ...min_value,
  message: (_, values) => i18n.t('validations.minValue', { value: values.min }),
});
extend('max_value', {
  ...max_value,
  message: (_, values) => i18n.t('validations.maxValue', { value: values.max }),
});
extend('max', {
  ...max,
  message: (_, values) => i18n.t('validations.max', { value: values.length }),
});

extend('email', {
  ...email,
  message: (_, values) => i18n.t('validations.email', values),
});

extend('phone', {
  validate: (phone) => {
    const { number, countryCode } = phone;
    if (!number || typeof number !== 'string') {
      return true;
    }

    const pn = parsePhoneNumber(number, { regionCode: countryCode });

    return pn?.valid;
  },
  params: ['phone'],
  message: (_, values) => i18n.t('validations.phone', values),
});

extend('requiredContactInfo', {
  computesRequired: true,
  params: ['isMissing'],
  validate: (_, { isMissing }) => !isMissing,
  message: () => '',
});

extend('canadianPostalCode', {
  message: (_, values) => i18n.t('validations.canadianPostalCode', values),
  validate: (value) => {
    const r = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return r.test(value);
  },
});

extend('birthday', {
  message: (_, values) => i18n.t('registration.personal_info.validations.birthdate', values),
  params: ['birthdate'],
  validate: (value, args) => {
    const { birthdate } = args;

    if (birthdate.year < 1901) {
      return false;
    }

    const dateFnsBirthdate = helpers.parseDateObject(birthdate);
    if (isValidDate(dateFnsBirthdate)) {
      const dayStart = startOfDay(new Date());
      if (isSameDay(dateFnsBirthdate, dayStart) || isAfter(dateFnsBirthdate, dayStart)) {
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

    if (!birthdate.year || !birthdate.month || !birthdate.day) {
      return true;
    }

    const dateFnsBirthdate = helpers.parseDateObject(birthdate);
    const now = endOfDay(new Date());
    const nowSubYears = subYears(now, age);
    if (isSameDay(dateFnsBirthdate, nowSubYears) || isBefore(dateFnsBirthdate, nowSubYears)) {
      return true;
    }

    return i18n.t('registration.personal_info.validations.minimumAge', { x: age });
  },
});

extend('oneOf', {
  ...oneOf,
  message: (_, values) => i18n.t('validations.oneOf', values),
});

extend('customValidator', {
  params: ['isValid', 'messageKey'],
  message: (_, values) => i18n.t(values.messageKey),
  validate: (value, { isValid }) => isValid,
});

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
