import { MIN_AGE_REGISTRATION, MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import utils from '@/entities/utils';
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment';
import { ECanadaProvinces } from '@/types';
import {
  EIndigenousTypes,
  IBirthDate,
  IOptionItemData,
  IPersonalInformation,
  IPhoneNumber,
} from './personalInformation.types';
import { required, maxLengthCheck } from '../../commonValidation';

export class PersonalInformation implements IPersonalInformation {
  firstName: string;

  middleName: string;

  lastName: string;

  preferredName: string;

  gender: IOptionItemData;

  genderOther: string;

  birthDate: IBirthDate;

  mobilePhone?: IPhoneNumber;

  homePhone?: IPhoneNumber;

  otherPhone?: IPhoneNumber;

  otherPhoneExtension?: string;

  email: string;

  preferredLanguage: IOptionItemData;

  preferredLanguageOther: string;

  primarySpokenLanguage: IOptionItemData;

  primarySpokenLanguageOther: string;

  indigenousProvince: ECanadaProvinces;

  indigenousType: EIndigenousTypes;

  indigenousCommunityId: string;

  indigenousCommunityOther: string;

  constructor(data?: unknown) {
    if (!data) {
      this.reset();
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    required(this.firstName, 'first name is required', errors);
    maxLengthCheck(this.firstName, MAX_LENGTH_SM, 'first name', errors);

    maxLengthCheck(this.middleName, MAX_LENGTH_SM, 'middle name', errors);

    required(this.lastName, 'last name is required', errors);
    maxLengthCheck(this.lastName, MAX_LENGTH_SM, 'last name', errors);

    maxLengthCheck(this.preferredName, MAX_LENGTH_SM, 'preferred name', errors);

    required(this.gender, 'gender is required', errors);
    maxLengthCheck(this.genderOther, MAX_LENGTH_MD, 'other gender', errors);

    required(this.birthDate.year, 'year is required', errors);
    required(this.birthDate.month, 'month is required', errors);
    required(this.birthDate.day, 'day is required', errors);
    this.birthday(this.birthDate, 'birth date not valid', errors);
    this.minimumAge(this.birthDate, 'minimum age required', errors);

    required(this.preferredLanguage, 'preferred language is required', errors);
    maxLengthCheck(this.preferredLanguageOther, MAX_LENGTH_MD, 'other preferred language', errors);

    maxLengthCheck(this.primarySpokenLanguageOther, MAX_LENGTH_MD, 'other primary spoken language', errors);

    this.phone(this.homePhone, 'home phone not valid', errors);
    this.phone(this.mobilePhone, 'mobile phone not valid', errors);
    this.phone(this.otherPhone, 'other phone not valid', errors);

    maxLengthCheck(this.otherPhoneExtension, MAX_LENGTH_MD, 'other phone extension', errors);

    this.isEmail(this.email, 'email not valid', errors);
    maxLengthCheck(this.email, MAX_LENGTH_MD, 'email', errors);

    this.hasPhoneOrEmail(this.homePhone, this.email, 'missing home phone or email', errors);

    return errors;
  }

  reset(): void {
    this.birthDate = {
      year: null,
      month: null,
      day: null,
    };
    this.gender = null;
    this.preferredLanguage = null;
    this.primarySpokenLanguage = null;
    this.indigenousType = null;
    this.indigenousCommunityId = null;
    this.indigenousCommunityOther = null;
  }

  birthday(value: IBirthDate, errorMsg: string, errors: string[]): void {
    const momentBirthdate = utils.getBirthDateMomentObject(value);
    const valid = momentBirthdate.isValid() && !momentBirthdate.isSameOrAfter(moment());
    if (!valid) errors.push(errorMsg);
  }

  minimumAge(birthdate: IBirthDate, errorMsg: string, errors: string[]): void {
    if (!birthdate.year || !birthdate.month || !birthdate.day) return;

    const age = MIN_AGE_REGISTRATION;
    const momentBirthdate = utils.getBirthDateMomentObject(birthdate);
    const now = moment().endOf('day');
    now.subtract(age, 'years');

    if (momentBirthdate.isSameOrBefore(now)) {
      return;
    }

    errors.push(errorMsg);
  }

  phone(value: IPhoneNumber, errorMsg: string, errors: string[]): void {
    if (!value) return;

    const { number, countryISO2 } = value;
    if (!number || typeof number !== 'string') {
      return;
    }

    const pn = new PhoneNumber(number, countryISO2);

    if (!pn.isValid()) errors.push(errorMsg);
  }

  isEmail(value: string, errorMsg: string, errors: string[]): void {
    if (!value) return;

    // eslint-disable-next-line
    const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if (!regex.test(value)) errors.push(errorMsg);
  }

  hasPhoneOrEmail(homePhone: IPhoneNumber, email: string, errorMsg: string, errors: string[]): void {
    const valid = homePhone?.number || email;
    if (!valid) errors.push(errorMsg);
  }
}
