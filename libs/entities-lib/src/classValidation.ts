import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment';
import { IOptionItemData } from '@libs/shared-lib/types';
import { MIN_AGE_REGISTRATION } from '@libs/shared-lib/constants/validations';
import birthdateHelper from './helpers/birthdate/birthdate';
import { IBirthDate } from './value-objects/identity-set/identitySet.types';
import { IPhoneNumber } from './value-objects/contact-information/contactInformation.types';

export const required = (value: unknown, errorMsg: string, errors: string[]) => {
  if (value === undefined || value === null || value === false) {
    errors.push(errorMsg);
  } else if (typeof value === 'string' && value.trim().length === 0) {
    errors.push(errorMsg);
  }
};

export const maxLengthCheck = (value: string, length: number, fieldName: string, errors: string[]) => {
  if (!value) {
    return;
  }
  const valid = value.trim().length <= length;
  if (!valid) {
    errors.push(`${fieldName} exceeds max length of ${length}`);
  }
};

export const isPhone = (value: IPhoneNumber, errorMsg: string, errors: string[]) => {
  if (!value) {
    return;
  }

  const { number, countryCode } = value;
  if (!number || typeof number !== 'string') {
    return;
  }

  const pn = new PhoneNumber(number, countryCode);

  if (!pn.isValid()) {
    errors.push(errorMsg);
  }
};

export const isEmail = (value: string, errorMsg: string, errors: string[]) => {
  if (!value) {
    return;
  }

  // eslint-disable-next-line
const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regex.test(value)) {
    errors.push(errorMsg);
  }
};

export const hasAtLeastAPhoneIfNoEmail = ({
  homePhoneNumber, mobilePhoneNumber, alternatePhoneNumber, email, errorMsg, errors,
}: {
  homePhoneNumber: IPhoneNumber;
  mobilePhoneNumber: IPhoneNumber;
  alternatePhoneNumber: IPhoneNumber;
  email: string;
  errorMsg: string;
  errors: string[];
}) => {
  const anyPhone = !!(homePhoneNumber?.number || mobilePhoneNumber?.number || alternatePhoneNumber?.number);
  const valid = anyPhone || email !== '';
  if (!valid) {
    errors.push(errorMsg);
  }
};

export const isValidCanadianPostalCode = (value: string, errorMsg: string, errors: string[]) => {
  if (!value) {
    return;
  }

  // eslint-disable-next-line
const regex = /^([a-zA-Z]\d[a-zA-Z]\s?\d[a-zA-Z]\d)$/;
  if (!regex.test(value)) {
    errors.push(errorMsg);
  }
};

export const isValidBirthday = (birthdate: IBirthDate, errorMsg: string, errors: string[]) => {
  const momentBirthdate = birthdateHelper.getBirthDateMomentObject(birthdate);
  const valid = birthdate.year > 0 && momentBirthdate.isValid() && !momentBirthdate.isSameOrAfter(moment());
  if (!valid) {
    errors.push(errorMsg);
  }
};

export const hasMinimumAge = (birthdate: IBirthDate, errorMsg: string, errors: string[]) => {
  if (!birthdate.year || !birthdate.month || !birthdate.day) {
    return;
  }

  const age = MIN_AGE_REGISTRATION;
  const momentBirthdate = birthdateHelper.getBirthDateMomentObject(birthdate);
  const now = moment().endOf('day');
  now.subtract(age, 'years');

  if (momentBirthdate.isSameOrBefore(now)) {
    return;
  }

  errors.push(errorMsg);
};

export const isValidOption = (option: IOptionItemData, specifiedOther: string, errorMsg: string, errors: string[]) => {
  const valid = !option?.isOther || (option.isOther && specifiedOther);
  if (!valid) {
    errors.push(errorMsg);
  }
};
