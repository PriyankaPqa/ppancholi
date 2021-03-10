import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { mockPersonalInformation } from './personalInformation.mock';
import { PersonalInformation } from './personalInformation';

const longText = 'x'.repeat(MAX_LENGTH_MD + 1);
const longSmallText = 'y'.repeat(MAX_LENGTH_SM + 1);
const mockData = mockPersonalInformation();

describe('>>> PersonalInformation', () => {
  describe('>> constructor', () => {
    it('should instantiate birth date', () => {
      const p = new PersonalInformation();
      expect(p.birthDate).not.toBeNull();
    });
  });

  describe('>> validation', () => {
    test('first name is required', () => {
      const p = new PersonalInformation();
      let results = p.validate();
      expect(results).toContain('first name is required');

      p.firstName = 'first name';
      results = p.validate();
      expect(results).not.toContain('first name is required');
    });
    test(`first name has a max of ${MAX_LENGTH_SM} characters`, () => {
      const p = new PersonalInformation();
      p.firstName = longSmallText;

      expect(p.validate()).toContain(`first name exceeds max length of ${MAX_LENGTH_SM}`);
    });

    test(`middle name has a max of ${MAX_LENGTH_SM} characters`, () => {
      const p = new PersonalInformation();
      p.middleName = longSmallText;

      expect(p.validate()).toContain(`middle name exceeds max length of ${MAX_LENGTH_SM}`);
    });

    test('last name is required', () => {
      const p = new PersonalInformation();
      let results = p.validate();
      expect(results).toContain('last name is required');

      p.lastName = 'last name';
      results = p.validate();
      expect(results).not.toContain('last name is required');
    });
    test(`last name has a max of ${MAX_LENGTH_SM} characters`, () => {
      const p = new PersonalInformation();
      p.lastName = longSmallText;

      expect(p.validate()).toContain(`last name exceeds max length of ${MAX_LENGTH_SM}`);
    });

    test(`preferred name has a max of ${MAX_LENGTH_SM} characters`, () => {
      const p = new PersonalInformation();
      p.preferredName = longSmallText;

      expect(p.validate()).toContain(`preferred name exceeds max length of ${MAX_LENGTH_SM}`);
    });

    test('gender is required', () => {
      const p = new PersonalInformation();
      let results = p.validate();
      expect(results).toContain('gender is required');

      p.gender = mockData.gender;
      results = p.validate();
      expect(results).not.toContain('gender is required');
    });
    test(`other gender has a max of ${MAX_LENGTH_MD} characters`, () => {
      const p = new PersonalInformation();
      p.genderOther = longText;

      expect(p.validate()).toContain(`other gender exceeds max length of ${MAX_LENGTH_MD}`);
    });

    test('year is required', () => {
      const p = new PersonalInformation();
      let results = p.validate();
      expect(results).toContain('year is required');

      p.birthDate.year = 2000;
      results = p.validate();
      expect(results).not.toContain('year is required');
    });
    test('month is required', () => {
      const p = new PersonalInformation();
      let results = p.validate();
      expect(results).toContain('month is required');

      p.birthDate.month = 2000;
      results = p.validate();
      expect(results).not.toContain('month is required');
    });
    test('day is required', () => {
      const p = new PersonalInformation();
      let results = p.validate();
      expect(results).toContain('day is required');

      p.birthDate.day = 2000;
      results = p.validate();
      expect(results).not.toContain('day is required');
    });
    test('minimum age required', () => {
      const p = new PersonalInformation();
      p.birthDate = {
        year: 2021,
        month: 1,
        day: 2,
      };
      const results = p.validate();
      expect(results).toContain('minimum age required');
    });

    test('preferred language is required', () => {
      const p = new PersonalInformation();
      let results = p.validate();
      expect(results).toContain('preferred language is required');

      p.preferredLanguage = mockData.preferredLanguage;
      results = p.validate();
      expect(results).not.toContain('preferred language is required');
    });
    test(`other preferred language has a max of ${MAX_LENGTH_MD} characters`, () => {
      const p = new PersonalInformation();
      p.preferredLanguageOther = longText;

      expect(p.validate()).toContain(`other preferred language exceeds max length of ${MAX_LENGTH_MD}`);
    });

    test(`other primary spoken language has a max of ${MAX_LENGTH_MD} characters`, () => {
      const p = new PersonalInformation();
      p.primarySpokenLanguageOther = longText;

      expect(p.validate()).toContain(`other primary spoken language exceeds max length of ${MAX_LENGTH_MD}`);
    });

    test('home phone should be valid', () => {
      const p = new PersonalInformation();
      p.homePhone = {
        countryISO2: 'CA',
        number: '123',
        e164Number: '234',
      };

      expect(p.validate()).toContain('home phone not valid');
    });
    test('mobile phone should be valid', () => {
      const p = new PersonalInformation();
      p.mobilePhone = {
        countryISO2: 'CA',
        number: '123',
        e164Number: '234',
      };

      expect(p.validate()).toContain('mobile phone not valid');
    });
    test('other phone should be valid', () => {
      const p = new PersonalInformation();
      p.otherPhone = {
        countryISO2: 'CA',
        number: '123',
        e164Number: '234',
      };

      expect(p.validate()).toContain('other phone not valid');
    });

    test(`other phone extension has a max of ${MAX_LENGTH_MD} characters`, () => {
      const p = new PersonalInformation();
      p.otherPhoneExtension = longText;

      expect(p.validate()).toContain(`other phone extension exceeds max length of ${MAX_LENGTH_MD}`);
    });

    test('email should be valid', () => {
      const p = new PersonalInformation();
      p.email = 'abcd';

      expect(p.validate()).toContain('email not valid');
    });
    test(`email has a max of ${MAX_LENGTH_MD} characters`, () => {
      const p = new PersonalInformation();
      p.email = longText;

      expect(p.validate()).toContain(`email exceeds max length of ${MAX_LENGTH_MD}`);
    });

    test('should have email or home phone', () => {
      const p = new PersonalInformation();
      expect(p.validate()).toContain('missing home phone or email');

      p.homePhone = {
        countryISO2: 'CA',
        number: '123',
        e164Number: '234',
      };
      p.email = null;
      expect(p.validate()).not.toContain('missing home phone or email');

      p.homePhone = null;
      p.email = 'abc';
      expect(p.validate()).not.toContain('missing home phone or email');
    });
  });
});
