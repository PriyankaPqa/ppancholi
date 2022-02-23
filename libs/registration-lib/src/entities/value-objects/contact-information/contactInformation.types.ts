import { IListOption, IOptionItemData } from '../../../types';

export interface IPhoneNumber {
  number?: string;
  countryCode?: string;
  e164Number: string;
  extension?: string;
}

/**
 * Interface used for the entity class
 */

export interface IContactInformationData {
  mobilePhoneNumber?: IPhoneNumber;

  homePhoneNumber?: IPhoneNumber;

  alternatePhoneNumber?: IPhoneNumber;

  email: string;

  preferredLanguage: IOptionItemData;

  preferredLanguageOther: string;

  primarySpokenLanguage: IOptionItemData;

  primarySpokenLanguageOther: string;

  emailValidatedByBackend: boolean;
}

export interface IContactInformationCreateRequest {
  homePhoneNumber?: IPhoneNumber;
  mobilePhoneNumber?: IPhoneNumber;
  alternatePhoneNumber?: IPhoneNumber;
  email: string;
  preferredLanguage: IListOption;
  primarySpokenLanguage: IListOption;
}

export interface IContactInformation extends IContactInformationData {
  validate(skipEmailPhoneRules: boolean): string[];
}

export interface IValidateEmailRequest {
  personId?: uuid;
  emailAddress: string;
}

export interface IValidateEmailPublicRequest extends IValidateEmailRequest{
  recaptchaToken: string;
}

export interface IApiError {
  status: string;
  code: string;
  title: string;
  detail: string;
  meta: Record<string, unknown>;
}

export interface IValidateEmailResponse {
  emailIsValid: boolean;
  errors: IApiError[];
}
