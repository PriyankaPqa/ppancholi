import Identity from '../core/Identity';
import ContactInformation from '../core/ContactInformation';

export interface IFields {
    firstName?: string,
    lastName?: string,
    middleName?: string,
    preferredName?: string,
    genderIndex?: number,
    genderOther?: string,
    birthdateMonth?: number,
    birthdateDay?: number,
    birthdateYear?: number,
    preferredLanguageIndex?: number,
    preferredLanguageOther?: string,
    primarySpokenLanguageIndex?: number,
    primarySpokenLanguageOther?: string,
    homePhoneNumber?: string,
    mobilePhoneNumber?: string,
    alternatePhoneNumber?: string,
    alternatePhoneNumberExtension?: string,
    email?: string,
}

export enum IdentityDataTest {
    firstName = 'personalInfo__firstName',
    lastName = 'personalInfo__lastName',
    middleName = 'personalInfo__middleName',
    preferredName = 'personalInfo__preferredName',
    gender = 'personalInfo__gender',
    genderOther = 'personalInfo__genderOther',
    birthdateMonth = 'personalInfo__month',
    birthdateDay = 'personalInfo__day',
    birthdateYear = 'personalInfo__year',
}

export enum ContactInformationDataTest {
    preferredLanguage = 'personalInfo__preferredLanguage',
    preferredLanguageOther = 'personalInfo__preferredLanguageOther',
    primarySpokenLanguage = 'personalInfo__primarySpokenLanguage',
    primarySpokenLanguageOther = 'personalInfo__primarySpokenLanguageOther',
    homePhoneNumber = 'personalInfo__homePhoneNumber',
    mobilePhoneNumber = 'personalInfo__mobilePhoneNumber',
    alternatePhoneNumber = 'personalInfo__alternatePhoneNumber',
    alternatePhoneNumberExtension = 'personalInfo__alternatePhoneNumberExtension',
    email = 'personalInfo__email',
}

class PersonalInformation {
    identity: Identity;

    contactInformation: ContactInformation

    constructor() {
      this.identity = new Identity(IdentityDataTest);
      this.contactInformation = new ContactInformation(ContactInformationDataTest);
    }

    async fill(fields: IFields) {
      await this.identity.fill(fields);
      await this.contactInformation.fill(fields);
    }
}

export default new PersonalInformation();
