/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import {
  ValidationProvider, extend, ValidationObserver, configure,
} from 'vee-validate';
import { parsePhoneNumber } from 'awesome-phonenumber';

import {
  // eslint-disable-next-line camelcase
  required, min, max, email, oneOf, regex, min_value, max_value, numeric,
} from 'vee-validate/dist/rules.umd.min';

import helpers from '@libs/entities-lib/helpers';
import Vue from 'vue';
import { isValid as isValidDate, isSameDay, isAfter, startOfDay, subYears, isBefore, endOfDay, parseISO } from 'date-fns';

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

extend('registrationNumber', {
  message: () => i18n.t('validations.registrationNumber', { length: 9 }),
  validate: (value) => /^[0-9]*$/.test(value) && value.length === 9,
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
  params: ['messageKey'],
  message: (_, values) => (values.messageKey && typeof values.messageKey === 'string'
    ? i18n.t(values.messageKey) : i18n.t('validations.required', values)),
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

extend('mustBeAfterOrSame', {
  computesRequired: true,
  message: (_, values) => i18n.t('validations.mustBeAfterOrSame', values),
  params: ['X', 'Y'],
  validate: (value, { X, Y }) => {
    const parsedX = parseISO(X);
    const parsedY = parseISO(Y);

    const xValid = isValidDate(parsedX);
    const yValid = isValidDate(parsedY);
    if (!xValid || !yValid) {
      return false;
    }
    return isSameDay(parsedX, parsedY) || isAfter(parsedX, parsedY);
  },
});

extend('mustBeBeforeOrSame', {
  computesRequired: true,
  message: (_, values) => i18n.t('validations.mustBeBeforeOrSame', values),
  params: ['X', 'Y'],
  validate: (value, { X, Y }) => {
    const parsedX = parseISO(X);
    const parsedY = parseISO(Y);

    const xValid = isValidDate(parsedX);
    const yValid = isValidDate(parsedY);
    if (!xValid || !yValid) {
      return false;
    }
    return isSameDay(parsedX, parsedY) || isBefore(parsedX, parsedY);
  },
});

extend('phoneRequired', {
  validate: ({ number }) => !(!number || typeof number !== 'string'),
  message: (_, values) => i18n.t('validations.required', values),
});

extend('customValidator', {
  params: ['isValid', 'messageKey', 'injection'],
  message: (_, values) => i18n.t(values.messageKey, values.injection),
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
    const regexExpression = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return regexExpression.test(value);
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

extend('requiredContactInfo', {
  computesRequired: true,
  params: ['isMissing'],
  validate: (value, { isMissing }) => !isMissing,
  message: () => '',
});

extend('requiredFile', {
  computesRequired: true,
  message: () => i18n.t('validations.required.file'),
  params: ['size'],
  validate: (value, { size }) => size > 0,
});

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
