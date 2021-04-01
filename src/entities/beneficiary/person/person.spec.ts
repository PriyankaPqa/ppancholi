import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { ECanadaProvinces } from '@/types';
import { EIndigenousTypes } from '@/entities/beneficiary';
import { mockPerson } from './person.mock';
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
      it(`has a max of ${MAX_LENGTH_MD} characters`, () => {
        const p = new Person();
        p.genderOther = longText;

        expect(p.validate()).toContain(`other gender exceeds max length of ${MAX_LENGTH_MD}`);
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

      test('minimum age required', () => {
        const p = new Person();
        p.birthDate = {
          year: 2021,
          month: 1,
          day: 2,
        };
        const results = p.validate();
        expect(results).toContain('minimum age required');
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
});
