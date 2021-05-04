import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../../constants/validations';
import { ECanadaProvinces } from '../../../types';
import { TemporaryAddress } from '../temporary-address';
import {
  mockGenderOther, mockIdentityData, mockIndigenousData, mockPerson,
} from './person.mock';
import { EIndigenousTypes } from './person.types';
import { Person } from './person';

const longText = 'x'.repeat(MAX_LENGTH_MD + 1);
const longSmallText = 'y'.repeat(MAX_LENGTH_SM + 1);
const mockData = mockPerson();

describe('>>> Person', () => {
  describe('>>constructor', () => {
    it('should initialize data if passed', () => {
      const p = new Person(mockPerson());
      expect(p).toEqual(mockPerson());
    });

    it('should reset if not data pass', () => {
      const p = new Person();
      expect(p.firstName).toEqual('');
      expect(p.middleName).toEqual('');
      expect(p.lastName).toEqual('');
      expect(p.preferredName).toEqual('');
      expect(p.gender).toEqual(null);
      expect(p.genderOther).toEqual(null);
      expect(p.birthDate).toEqual({
        year: null,
        month: null,
        day: null,
      });
      expect(p.indigenousProvince).toEqual(null);
      expect(p.indigenousType).toEqual(null);
      expect(p.indigenousCommunityId).toEqual(null);
      expect(p.indigenousCommunityOther).toEqual(null);
      expect(p.temporaryAddress).toEqual(new TemporaryAddress());
    });
  });

  describe('>> validation', () => {
    describe('First name', () => {
      it('is required', () => {
        const p = new Person();
        let results = p.validate();
        expect(results).toContain('first name is required');

        p.firstName = 'first name';
        results = p.validate();
        expect(results).not.toContain('first name is required');
      });
      it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
        const p = new Person();
        p.firstName = longSmallText;

        expect(p.validate()).toContain(`first name exceeds max length of ${MAX_LENGTH_SM}`);
      });
    });

    describe('Middle name', () => {
      it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
        const p = new Person();
        p.middleName = longSmallText;

        expect(p.validate()).toContain(`middle name exceeds max length of ${MAX_LENGTH_SM}`);
      });
    });

    describe('Last name', () => {
      it('is required', () => {
        const p = new Person();
        let results = p.validate();
        expect(results).toContain('last name is required');

        p.lastName = 'last name';
        results = p.validate();
        expect(results).not.toContain('last name is required');
      });

      it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
        const p = new Person();
        p.lastName = longSmallText;

        expect(p.validate()).toContain(`last name exceeds max length of ${MAX_LENGTH_SM}`);
      });
    });

    describe('Preferred name', () => {
      it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
        const p = new Person();
        p.preferredName = longSmallText;

        expect(p.validate()).toContain(`preferred name exceeds max length of ${MAX_LENGTH_SM}`);
      });
    });

    describe('Gender', () => {
      it('is required', () => {
        const p = new Person();
        let results = p.validate();
        expect(results).toContain('gender is required');

        p.gender = mockData.gender;
        results = p.validate();
        expect(results).not.toContain('gender is required');
      });
    });

    describe('Other gender', () => {
      it(`has a max of ${MAX_LENGTH_MD} characters if gender.isOther is true`, () => {
        const p = new Person();
        p.gender = mockGenderOther();
        p.genderOther = longText;

        expect(p.validate()).toContain(`other gender exceeds max length of ${MAX_LENGTH_MD}`);
      });

      it('is required if gender.isOther is true', () => {
        const p = new Person();
        p.gender = mockGenderOther();
        const results = p.validate();
        expect(results).toContain('genderOther is required');
      });

      it('is not required if gender.isOther is false', () => {
        const p = new Person();
        p.gender = {
          id: 'guid',
          name: null,
          orderRank: 0,
          isOther: false,
          isDefault: false,
          status: 0,
        };
        const results = p.validate();
        expect(results).not.toContain('genderOther is required');
      });
    });

    describe('Birthdate', () => {
      test('year is required', () => {
        const p = new Person();
        let results = p.validate();
        expect(results).toContain('year is required');

        p.birthDate.year = 2000;
        results = p.validate();
        expect(results).not.toContain('year is required');
      });

      test('month is required', () => {
        const p = new Person();
        let results = p.validate();
        expect(results).toContain('month is required');

        p.birthDate.month = 2000;
        results = p.validate();
        expect(results).not.toContain('month is required');
      });

      test('day is required', () => {
        const p = new Person();
        let results = p.validate();
        expect(results).toContain('day is required');

        p.birthDate.day = 2000;
        results = p.validate();
        expect(results).not.toContain('day is required');
      });

      test('minimum age required if skipAgeRestriction is false', () => {
        const p = new Person();
        p.birthDate = {
          year: 2021,
          month: 1,
          day: 2,
        };
        const results = p.validate();
        expect(results).toContain('minimum age required');
      });

      test('minimum age required is skipped skipAgeRestriction is true', () => {
        const p = new Person();
        p.birthDate = {
          year: 2021,
          month: 1,
          day: 2,
        };
        const results = p.validate(true);
        expect(results).not.toContain('minimum age required');
      });

      test('Should return invalid if the year is negative', () => {
        const p = new Person();
        p.birthDate = {
          year: -1000,
          day: 1,
          month: 1,
        };
        const results = p.validate();
        expect(results).toContain('birth date not valid');
      });

      test('Should return valid if birthdate is ok', () => {
        const p = new Person();
        p.birthDate = {
          year: 1000,
          day: 1,
          month: 1,
        };
        const results = p.validate();
        expect(results).not.toContain('birth date not valid');
      });
    });

    describe('indigenousProvince', () => {
      it('is required if indigenousProvince is not null', () => {
        const p = new Person();
        let results = p.validate();
        expect(results).not.toContain('indigenousType is required');

        p.indigenousProvince = ECanadaProvinces.AB;
        results = p.validate();
        expect(results).toContain('indigenousType is required');
      });
    });

    describe('indigenousCommunityId', () => {
      it('is required if indigenousType is not null', () => {
        const p = new Person();
        let results = p.validate();
        expect(results).not.toContain('indigenousCommunityId is required');

        p.indigenousType = EIndigenousTypes.FirstNations;
        results = p.validate();
        expect(results).toContain('indigenousCommunityId is required');
      });

      it('is not required if indigenousType is other', () => {
        const p = new Person();
        p.indigenousType = EIndigenousTypes.Other;
        const results = p.validate();
        expect(results).not.toContain('indigenousCommunityId is required');
      });
    });

    describe('indigenousCommunityOther', () => {
      it('is required if indigenousType is other', () => {
        const p = new Person();
        p.indigenousType = EIndigenousTypes.Other;
        const results = p.validate();
        expect(results).toContain('indigenousCommunityOther is required');
      });

      it(`has a max of ${MAX_LENGTH_MD} characters`, () => {
        const p = new Person();
        p.indigenousType = EIndigenousTypes.Other;
        p.indigenousCommunityOther = longText;
        const results = p.validate();
        expect(results).toContain(`indigenousCommunityOther exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });
  });

  describe('Methods', () => {
    describe('setIdentity', () => {
      it('should set identity related attributes', () => {
        const p = new Person();
        p.setIdentity(mockPerson());
        expect(p.firstName).toEqual(mockIdentityData().firstName);
        expect(p.middleName).toEqual(mockIdentityData().middleName);
        expect(p.lastName).toEqual(mockIdentityData().lastName);
        expect(p.preferredName).toEqual(mockIdentityData().preferredName);
        expect(p.gender).toEqual(mockIdentityData().gender);
        expect(p.genderOther).toEqual(mockIdentityData().genderOther);
        expect(p.birthDate).toEqual(mockIdentityData().birthDate);
      });
    });

    describe('setIndigenousIdentity', () => {
      it('should set indigenous identity related attributes', () => {
        const p = new Person();
        p.setIndigenousIdentity(mockPerson());

        expect(p.indigenousProvince).toEqual(mockIndigenousData().indigenousProvince);
        expect(p.indigenousType).toEqual(mockIndigenousData().indigenousType);
        expect(p.indigenousCommunityId).toEqual(mockIndigenousData().indigenousCommunityId);
        expect(p.indigenousCommunityOther).toEqual(mockIndigenousData().indigenousCommunityOther);
      });
    });
  });
});
