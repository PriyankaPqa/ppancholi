import { IListOption, IOptionItemData } from '../../../types';

/**
 * Enums
 */
export enum EPhoneTypes {
  Mobile = 'Mobile',
  Home = 'Home',
  Other = 'Other',
}

/**
 * Value objects
 */
export interface IPhoneNumber {
  id?: string;
  number: string;
  phoneNumberType?: EPhoneTypes;
  countryISO2?: string;
  e164Number: string;
}

export interface IPhoneNumberForCreate {
  number: string;
  e164Number: string;
  countryCode?: string;
  extension?: string;
}

/**
 * Interface used for the entity class
 */

export interface IContactInformationData {
  mobilePhone?: IPhoneNumber;

  homePhone?: IPhoneNumber;

  otherPhone?: IPhoneNumber;

  otherPhoneExtension?: string;

  email: string;

  preferredLanguage: IOptionItemData;

  preferredLanguageOther: string;

  primarySpokenLanguage: IOptionItemData;

  primarySpokenLanguageOther: string;
}

export interface IContactInformationForCreate {
  homePhoneNumber?: IPhoneNumberForCreate;
  mobilePhoneNumber?: IPhoneNumberForCreate;
  alternatePhoneNumber?: IPhoneNumberForCreate;
  email: string;
  preferredLanguage: IListOption;
  primarySpokenLanguage: IListOption;
}

export interface IContactInformation extends IContactInformationData {
  validate(skipEmailPhoneRules: boolean): string[];
}
