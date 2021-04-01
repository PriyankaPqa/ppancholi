import { MAX_LENGTH_MD } from '@/constants/validations';

import { IOptionItemData } from '@/types';
import {
  IContactInformation,
  IContactInformationData,
  IPhoneNumber,
  EPhoneTypes,
} from './contactInformation.types';

import {
  required, maxLengthCheck, isPhone, isEmail, hasPhoneOrEmail,
} from '../../commonValidation';

export class ContactInformation implements IContactInformation {
  mobilePhone?: IPhoneNumber;

  homePhone?: IPhoneNumber;

  otherPhone?: IPhoneNumber;

  otherPhoneExtension?: string;

  email: string;

  preferredLanguage: IOptionItemData;

  preferredLanguageOther: string;

  primarySpokenLanguage: IOptionItemData;

  primarySpokenLanguageOther: string;

  constructor(data?: IContactInformationData) {
    if (!data) {
      this.reset();
    } else {
      this.mobilePhone = data.mobilePhone;
      this.homePhone = data.homePhone;
      this.otherPhone = data.otherPhone;
      this.otherPhoneExtension = data.otherPhoneExtension;
      this.email = data.email;
      this.preferredLanguage = data.preferredLanguage;
      this.preferredLanguageOther = data.preferredLanguageOther;
      this.primarySpokenLanguage = data.primarySpokenLanguage;
      this.primarySpokenLanguageOther = data.primarySpokenLanguageOther;
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    required(this.preferredLanguage, 'preferred language is required', errors);
    maxLengthCheck(this.preferredLanguageOther, MAX_LENGTH_MD, 'other preferred language', errors);

    maxLengthCheck(this.primarySpokenLanguageOther, MAX_LENGTH_MD, 'other primary spoken language', errors);

    isPhone(this.homePhone, 'home phone not valid', errors);
    isPhone(this.mobilePhone, 'mobile phone not valid', errors);
    isPhone(this.otherPhone, 'other phone not valid', errors);

    maxLengthCheck(this.otherPhoneExtension, MAX_LENGTH_MD, 'other phone extension', errors);

    isEmail(this.email, 'email not valid', errors);
    maxLengthCheck(this.email, MAX_LENGTH_MD, 'email', errors);

    hasPhoneOrEmail(this.homePhone, this.email, 'missing home phone or email', errors);

    return errors;
  }

  reset(): void {
    this.mobilePhone = {
      number: '',
      phoneNumberType: EPhoneTypes.Mobile,
      countryISO2: 'CA',
      e164Number: '',
    };
    this.homePhone = {
      number: '',
      phoneNumberType: EPhoneTypes.Home,
      countryISO2: 'CA',
      e164Number: '',
    };
    this.otherPhone = {
      number: '',
      phoneNumberType: EPhoneTypes.Other,
      countryISO2: 'CA',
      e164Number: '',
    };
    this.otherPhoneExtension = '';
    this.email = '';
    this.preferredLanguage = null;
    this.preferredLanguageOther = '';
    this.primarySpokenLanguage = null;
    this.primarySpokenLanguageOther = '';
  }
}
