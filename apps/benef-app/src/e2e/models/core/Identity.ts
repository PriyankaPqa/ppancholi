import { Selector, t } from 'testcafe';
import { selectListElement } from '../../helpers';

export interface IDataTest {
    firstName: string;
    lastName: string;
    middleName : string;
    preferredName: string;
    gender: string;
    genderOther: string;
    birthdateMonth : string;
    birthdateDay : string;
    birthdateYear : string;
}

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
}

export default class Identity {
    firstName: Selector;

    lastName: Selector;

    middleName: Selector;

    preferredName: Selector;

    gender: Selector;

    genderOther: Selector;

    birthdateMonth: Selector;

    birthdateDay: Selector;

    birthdateYear: Selector;

    dataTest: IDataTest

    constructor(dataTest: IDataTest) {
      this.dataTest = dataTest;
      this.firstName = Selector('input').withAttribute('data-test', dataTest.firstName);
      this.lastName = Selector('input').withAttribute('data-test', dataTest.lastName);
      this.middleName = Selector('input').withAttribute('data-test', dataTest.middleName);
      this.preferredName = Selector('input').withAttribute('data-test', dataTest.preferredName);
      this.gender = Selector('div').withAttribute('data-test', dataTest.gender);
      this.genderOther = Selector('input').withAttribute('data-test', dataTest.genderOther);
      this.birthdateMonth = Selector('input').withAttribute('data-test', dataTest.birthdateMonth);
      this.birthdateDay = Selector('input').withAttribute('data-test', dataTest.birthdateDay);
      this.birthdateYear = Selector('input').withAttribute('data-test', dataTest.birthdateYear);
    }

    async setFirstName(name: string) {
      await t.typeText(this.firstName(), name);
    }

    async setLastName(name: string) {
      await t.typeText(this.lastName(), name);
    }

    async setMiddleName(name: string) {
      await t.typeText(this.middleName(), name);
    }

    async setPreferredName(name: string) {
      await t.typeText(this.preferredName(), name);
    }

    async setGender(index: number) {
      await selectListElement(this.dataTest.gender, index);
    }

    async setGenderOther(name: string) {
      await t.typeText(this.genderOther(), name);
    }

    async setBirthDateMonth(month: number) {
      // January is index 0
      await selectListElement(this.dataTest.birthdateMonth, month - 1);
    }

    async setBirthdateDay(day: string) {
      await t.typeText(this.birthdateDay(), day);
    }

    async setBirthdateYear(day: string) {
      await t.typeText(this.birthdateYear(), day);
    }

    async setBirthDate({ day, month, year }: {day: number; month: number, year: number}) {
      await this.setBirthDateMonth(month);
      await this.setBirthdateDay(day.toString());
      await this.setBirthdateYear(year.toString());
    }

    async fill(fields: IFields) {
      if (fields.firstName) {
        await this.setFirstName(fields.firstName);
      }
      if (fields.middleName) {
        await this.setMiddleName(fields.middleName);
      }
      if (fields.lastName) {
        await this.setLastName(fields.lastName);
      }
      if (fields.preferredName) {
        await this.setPreferredName(fields.preferredName);
      }
      if (fields.genderIndex !== undefined) {
        await this.setGender(fields.genderIndex);
      }
      if (fields.genderOther) {
        await this.setGenderOther(fields.genderOther);
      }
      if (fields.birthdateMonth) {
        await this.setBirthDateMonth(fields.birthdateMonth);
      }
      if (fields.birthdateDay) {
        await this.setBirthdateDay(fields.birthdateDay.toString());
      }
      if (fields.birthdateYear) {
        await this.setBirthdateYear(fields.birthdateYear.toString());
      }
    }
}
