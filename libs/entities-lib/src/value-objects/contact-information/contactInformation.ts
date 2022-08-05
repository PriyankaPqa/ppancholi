import _cloneDeep from 'lodash/cloneDeep';
import { MAX_LENGTH_MD } from '@libs/core-lib/constants/validations';
import { IOptionItemData } from '@libs/core-lib/types';
import {
  IContactInformation,
  IContactInformationData,
  IPhoneNumber,
} from './contactInformation.types';

import {
  required, maxLengthCheck, isPhone, hasAtLeastAPhoneIfNoEmail, isValidOption,
} from '../../classValidation';

export class ContactInformation implements IContactInformation {
  mobilePhoneNumber?: IPhoneNumber;

  homePhoneNumber?: IPhoneNumber;

  alternatePhoneNumber?: IPhoneNumber;

  email: string;

  preferredLanguage: IOptionItemData;

  preferredLanguageOther: string;

  primarySpokenLanguage: IOptionItemData;

  primarySpokenLanguageOther: string;

  emailValidatedByBackend: boolean;

  constructor(data?: IContactInformationData) {
    this.reset();
    this.mobilePhoneNumber = _cloneDeep(data?.mobilePhoneNumber) || this.mobilePhoneNumber;
    this.homePhoneNumber = _cloneDeep(data?.homePhoneNumber) || this.homePhoneNumber;
    this.alternatePhoneNumber = _cloneDeep(data?.alternatePhoneNumber) || this.alternatePhoneNumber;
    this.email = data?.email || this.email;
    this.preferredLanguage = _cloneDeep(data?.preferredLanguage) || this.preferredLanguage;
    this.preferredLanguageOther = data?.preferredLanguageOther || this.preferredLanguageOther;
    this.primarySpokenLanguage = _cloneDeep(data?.primarySpokenLanguage) || this.primarySpokenLanguage;
    this.primarySpokenLanguageOther = data?.primarySpokenLanguageOther || this.primarySpokenLanguageOther;
    this.emailValidatedByBackend = data ? data.emailValidatedByBackend : this.emailValidatedByBackend;
  }

  validate(skipEmailPhoneRules: boolean): string[] {
    const errors: string[] = [];

    required(this.preferredLanguage, 'preferred language is required', errors);
    maxLengthCheck(this.preferredLanguageOther, MAX_LENGTH_MD, 'other preferred language', errors);

    maxLengthCheck(this.primarySpokenLanguageOther, MAX_LENGTH_MD, 'other primary spoken language', errors);
    isValidOption(this.primarySpokenLanguage, this.primarySpokenLanguageOther, 'other primary spoken language is required', errors);

    isPhone(this.homePhoneNumber, 'home phone not valid', errors);
    isPhone(this.mobilePhoneNumber, 'mobile phone not valid', errors);
    isPhone(this.alternatePhoneNumber, 'other phone not valid', errors);

    maxLengthCheck(this.alternatePhoneNumber.extension, MAX_LENGTH_MD, 'alternate phone extension', errors);

    // isEmail(this.email, 'email not valid', errors);
    // maxLengthCheck(this.email, MAX_LENGTH_MD, 'email', errors);

    if (!skipEmailPhoneRules) {
      hasAtLeastAPhoneIfNoEmail({
        homePhoneNumber: this.homePhoneNumber,
        mobilePhoneNumber: this.mobilePhoneNumber,
        alternatePhoneNumber: this.alternatePhoneNumber,
        email: this.email,
        errorMsg: 'at least one phone is required if no email',
        errors,
      });

      if (this.homePhoneNumber?.number === '' && this.mobilePhoneNumber?.number === '' && this.alternatePhoneNumber?.number === '') {
        required(this.email, 'email is required if no phone', errors);
      }
    }

    if (this.email && !this.emailValidatedByBackend) {
      errors.push('invalid email');
    }

    return errors;
  }

  reset(): void {
    this.mobilePhoneNumber = {
      number: '',
      countryCode: 'CA',
      e164Number: '',
      extension: '',
    };
    this.homePhoneNumber = {
      number: '',
      countryCode: 'CA',
      e164Number: '',
      extension: '',
    };
    this.alternatePhoneNumber = {
      number: '',
      countryCode: 'CA',
      e164Number: '',
      extension: '',
    };
    this.email = '';
    this.preferredLanguage = null;
    this.preferredLanguageOther = null;
    this.primarySpokenLanguage = null;
    this.primarySpokenLanguageOther = null;
    this.emailValidatedByBackend = true;
  }
}
