/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import {
  ValidationProvider, extend, ValidationObserver, configure,
} from 'vee-validate';
import PhoneNumber from 'awesome-phonenumber';
import {
  // eslint-disable-next-line camelcase
  required, min, max, email, oneOf, regex, min_value, max_value, numeric,
} from 'vee-validate/dist/rules.umd.min';

import _isEmpty from 'lodash/isEmpty';
import Vue from 'vue';
import moment from '@/ui/plugins/moment';
import helpers from '@/ui/helpers';
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
extend('lessThanStrict', {
  params: ['maximum'],
  validate: (value, { maximum }) => (typeof maximum === 'number' ? maximum > value : true),
  message: (_, values) => i18n.t('validations.approval.max', { value: values.maximum }),
});
extend('greaterThanStrict', {
  params: ['minimum'],
  validate: (value, { minimum }) => (typeof minimum === 'number' ? value > minimum : true),
  message: (_, values) => i18n.t('validations.approval.min', { value: values.minimum }),
});
extend('betweenStrict', {
  params: ['minimum', 'maximum'],
  validate: (value, { minimum, maximum }) => {
    const greaterThanMin = typeof minimum !== 'undefined' && minimum !== null ? value > minimum : true;
    const lessThanMax = typeof maximum !== 'undefined' && maximum !== null ? value < maximum : true;
    return greaterThanMin && lessThanMax;
  },
  message: (_, values) => {
    if (typeof values.maximum === 'number' && typeof values.minimum === 'number') {
      return i18n.t('validations.between', { min: values.minimum, max: values.maximum });
    }
    if (typeof values.maximum === 'number' && typeof values.minimum !== 'number') {
      return i18n.t('validations.approval.max', { value: values.maximum });
    }
    if (typeof values.maximum !== 'number' && typeof values.minimum === 'number') {
      return i18n.t('validations.approval.min', { value: values.minimum });
    }
    return '';
  },
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

extend('phoneOrEmail', {
  computesRequired: true,
  params: ['isPhoneRequired', 'isEmailRequired'],
  validate: (value, { isPhoneRequired, isEmailRequired }) => isEmailRequired === false || isPhoneRequired === false,
  message: (_, values) => i18n.t('validations.phoneOrEmail', values),
});

extend('validateEmailByBackend', {
  computesRequired: true,
  params: ['failedByBackend'],
  validate: (value, { failedByBackend }) => !failedByBackend,
  message: (_, values) => i18n.t('crcregistration.confirmation.error.invalid_email.title', values),
});

extend('phoneRequired', {
  validate: ({ number }) => !(!number || typeof number !== 'string'),
  message: (_, values) => i18n.t('validations.required', values),
});

extend('requiredIfNoOptionSelected', {
  computesRequired: true,
  message: (_, values) => i18n.t('validations.requiredIfNoOptionSelected', values),
  params: ['filterOptions'],
  validate: (value, { filterOptions }) => {
    const isEmpty = !!(!value || value.length === 0);
    const isRequired = _isEmpty(filterOptions);
    return {
      valid: !isRequired ? true : !isEmpty,
      required: isRequired,
    };
  },
});

extend('maxNestedProperty', {
  computesRequired: false,
  params: ['prop', 'max'],
  validate: (value, { prop, max }) => (value[prop] ? (value[prop].length <= max) : true),
  message: i18n.t('validations.max', { length: '{max}' }),
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

extend('mustBeBeforeStrict', {
  computesRequired: true,
  message: (_, values) => i18n.t('validations.mustBeBefore', values),
  params: ['X', 'Y'],
  validate: (value, { X, Y }) => {
    const xValid = moment(X, 'YYYY-MM-DD', true).isValid();
    const yValid = moment(Y, 'YYYY-MM-DD', true).isValid();
    if (!xValid || !yValid) return false;
    return moment(X).isBefore(Y);
  },
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

extend('mustBeAfterStrict', {
  computesRequired: true,
  message: (_, values) => i18n.t('validations.mustBeAfter', values),
  params: ['X', 'Y'],
  validate: (value, { X, Y }) => {
    const xValid = moment(X, 'YYYY-MM-DD', true).isValid();
    const yValid = moment(Y, 'YYYY-MM-DD', true).isValid();
    if (!xValid || !yValid) return false;
    return moment(X).isAfter(Y);
  },
});

extend('openDateMustBeBeforeCloseDateIfNotNull', {
  computesRequired: false, // open/close date are NOT required
  message: (_, values) => i18n.t('validations.openDateMustBeBeforeCloseDateIfNotNull', values),
  params: ['startDate', 'endDate'],
  validate: (value, { startDate, endDate }) => {
    if (!startDate || !endDate) return true;
    return moment(startDate).isBefore(endDate);
  },
});

extend('closeDateMustBeAfterOpenDateIfNotNull', {
  computesRequired: false, // open/close date are NOT required
  message: (_, values) => i18n.t('validations.closeDateMustBeAfterOpenDateIfNotNull', values),
  params: ['startDate', 'endDate'],
  validate: (value, { startDate, endDate }) => {
    if (!startDate || !endDate) return true;
    return moment(startDate).isBefore(endDate);
  },
});

extend('birthday', {
  message: (_, values) => i18n.t('validations.birthdate', values),
  params: ['birthdate'],
  validate: (value, args) => {
    const { birthdate } = args;
    const momentBirthdate = helpers.getBirthDateMomentObject(birthdate);
    if (momentBirthdate.isValid()) {
      if (momentBirthdate.isSameOrAfter(moment())) {
        return i18n.t('validations.notInFuture');
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
    const momentBirthdate = helpers.getBirthDateMomentObject(birthdate);
    const now = moment().endOf('day');
    now.subtract(age, 'years');

    if (momentBirthdate.isSameOrBefore(now)) {
      return true;
    }

    return i18n.t('validations.minimumAge', { x: age });
  },
});

extend('lessThan150years', {
  message: (_, values) => i18n.t('validations.lessThan150years', values),
  params: ['birthdate'],
  validate: (value, args) => {
    const { birthdate } = args;
    const now = moment().endOf('day');
    const momentBirthdate = helpers.getBirthDateMomentObject(birthdate);
    return now.diff(momentBirthdate, 'years') <= 150;
  },
});

extend('validateEligibilityCriteria', {
  message: (_, values) => i18n.t('validations.required', values),
  params: ['needImpacted', 'needAuthenticated', 'hasCompletedAssessments'],
  validate: (value, { needImpacted, needAuthenticated, hasCompletedAssessments }) => needImpacted || needAuthenticated || hasCompletedAssessments,
});

extend('canadianPostalCode', {
  message: (_, values) => i18n.t('validations.canadianPostalCode', values),
  validate: (value) => {
    const regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return regex.test(value);
  },
});

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
