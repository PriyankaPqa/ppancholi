import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment';
import helpers from '../ui/helpers';
import { MIN_AGE_REGISTRATION } from '../constants/validations';
import { IBirthDate } from './value-objects/person/person.types';
import { IPhoneNumber } from './value-objects/contact-information/contactInformation.types';

export const required = (value: unknown, errorMsg: string, errors: string[]) => {
  if (value === undefined || value === null || value === false) {
    errors.push(errorMsg);
  } else if (typeof value === 'string' && value.trim().length === 0) {
    errors.push(errorMsg);
  }
};

export const maxLengthCheck = (value: string, length: number, fieldName: string, errors: string[]) => {
  if (!value) return;
  const valid = value.trim().length <= length;
  if (!valid) errors.push(`${fieldName} exceeds max length of ${length}`);
};

export const isPhone = (value: IPhoneNumber, errorMsg: string, errors: string[]) => {
  if (!value) return;

  const { number, countryISO2 } = value;
  if (!number || typeof number !== 'string') {
    return;
  }

  const pn = new PhoneNumber(number, countryISO2);

  if (!pn.isValid()) errors.push(errorMsg);
};

export const isEmail = (value: string, errorMsg: string, errors: string[]) => {
  if (!value) return;

  // eslint-disable-next-line
const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (!regex.test(value)) errors.push(errorMsg);
};

export const hasPhoneOrEmail = (homePhone: IPhoneNumber, email: string, errorMsg: string, errors: string[]) => {
  const valid = homePhone?.number || email;
  if (!valid) errors.push(errorMsg);
};

export const isValidCanadianPostalCode = (value: string, errorMsg: string, errors: string[]) => {
  if (!value) return;

  // eslint-disable-next-line
const regex = /^([a-zA-Z]\d[a-zA-Z]\s?\d[a-zA-Z]\d)$/;
  if (!regex.test(value)) errors.push(errorMsg);
};

export const isValidBirthday = (birthdate: IBirthDate, errorMsg: string, errors: string[]) => {
  const momentBirthdate = helpers.getBirthDateMomentObject(birthdate);
  const valid = birthdate.year > 0 && momentBirthdate.isValid() && !momentBirthdate.isSameOrAfter(moment());
  if (!valid) errors.push(errorMsg);
};

export const hasMinimumAge = (birthdate: IBirthDate, errorMsg: string, errors: string[]) => {
  if (!birthdate.year || !birthdate.month || !birthdate.day) return;

  const age = MIN_AGE_REGISTRATION;
  const momentBirthdate = helpers.getBirthDateMomentObject(birthdate);
  const now = moment().endOf('day');
  now.subtract(age, 'years');

  if (momentBirthdate.isSameOrBefore(now)) {
    return;
  }

  errors.push(errorMsg);
};
