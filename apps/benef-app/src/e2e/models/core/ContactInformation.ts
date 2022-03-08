import { Selector, t } from 'testcafe';
import { selectListElement } from '../../helpers';

export interface IDataTest {
    preferredLanguage?: string,
    preferredLanguageOther?: string,
    primarySpokenLanguage?: string,
    primarySpokenLanguageOther?: string,
    homePhoneNumber?: string,
    mobilePhoneNumber?: string,
    alternatePhoneNumber?: string,
    alternatePhoneNumberExtension?: string,
    email?: string,
}

export interface IFields {
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

export default class ContactInformation {
    preferredLanguage: Selector;

    preferredLanguageOther: Selector;

    primarySpokenLanguage: Selector;

    primarySpokenLanguageOther: Selector;

    homePhoneNumber: Selector;

    mobilePhoneNumber: Selector;

    alternatePhoneNumber: Selector;

    alternatePhoneNumberExtension: Selector;

    email: Selector;

    dataTest: IDataTest;

    constructor(dataTest: IDataTest) {
      this.dataTest = dataTest;

      this.preferredLanguage = Selector('input')
        .withAttribute('data-test', dataTest.preferredLanguage);

      this.preferredLanguageOther = Selector('input')
        .withAttribute('data-test', dataTest.preferredLanguageOther);

      this.primarySpokenLanguage = Selector('input').withAttribute('data-test', dataTest.primarySpokenLanguage);

      this.primarySpokenLanguageOther = Selector('input').withAttribute('data-test', dataTest.primarySpokenLanguageOther);

      this.homePhoneNumber = Selector('input')
        .withAttribute('data-test', dataTest.homePhoneNumber);

      this.mobilePhoneNumber = Selector('input')
        .withAttribute('data-test', dataTest.mobilePhoneNumber);

      this.alternatePhoneNumber = Selector('input')
        .withAttribute('data-test', dataTest.alternatePhoneNumber);

      this.alternatePhoneNumberExtension = Selector('input')
        .withAttribute('data-test', dataTest.alternatePhoneNumberExtension);

      this.email = Selector('input')
        .withAttribute('data-test', dataTest.email);
    }

    async setPreferredLanguage(index: number) {
      await selectListElement(this.dataTest.preferredLanguage, index);
    }

    async setPrimarySpokenLanguage(index: number) {
      await selectListElement(this.dataTest.primarySpokenLanguage, index);
    }

    async setHomePhoneNumber(phoneNumber: string) {
      await t.typeText(this.homePhoneNumber(), phoneNumber);
    }

    async setMobilePhoneNumber(phoneNumber: string) {
      await t.typeText(this.mobilePhoneNumber(), phoneNumber);
    }

    async setAlternatePhoneNumber(phoneNumber: string) {
      await t.typeText(this.alternatePhoneNumber(), phoneNumber);
    }

    async setAlternatePhoneExtension(extension: string) {
      await t.typeText(this.alternatePhoneNumberExtension(), extension);
    }

    async setEmail(email: string) {
      await t.typeText(this.email(), email);
    }

    async fill(fields: IFields) {
      if (fields.preferredLanguageIndex !== undefined) {
        await this.setPreferredLanguage(fields.preferredLanguageIndex);
      }
      if (fields.primarySpokenLanguageIndex !== undefined) {
        await this.setPrimarySpokenLanguage(fields.primarySpokenLanguageIndex);
      }
      if (fields.homePhoneNumber) {
        await this.setHomePhoneNumber(fields.homePhoneNumber);
      }
      if (fields.mobilePhoneNumber) {
        await this.setMobilePhoneNumber(fields.mobilePhoneNumber);
      }
      if (fields.alternatePhoneNumber) {
        await this.setAlternatePhoneNumber(fields.alternatePhoneNumber);
      }
      if (fields.alternatePhoneNumberExtension) {
        await this.setAlternatePhoneExtension(fields.alternatePhoneNumberExtension);
      }
      if (fields.email) {
        await this.setEmail(fields.email);
      }
    }
}
