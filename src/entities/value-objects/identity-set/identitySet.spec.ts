import {
  IdentitySet, EIndigenousTypes, mockIdentitySetData,
  mockGenderOther, IHoneyPotIdentitySet,
} from './index';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../../constants/validations';
import { ECanadaProvinces } from '../../../types';
import helpers from '../../../ui/helpers';

const longText = 'x'.repeat(MAX_LENGTH_MD + 1);
const longSmallText = 'y'.repeat(MAX_LENGTH_SM + 1);

describe('Identity Set', () => {
  describe('constructor', () => {
    it('should initialize data if passed', () => {
      const p = new IdentitySet(mockIdentitySetData());
      expect(p).toEqual(mockIdentitySetData());
    });

    it('should reset if not data pass', () => {
      const p = new IdentitySet();
      expect(p.name).toEqual(null);
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
      expect(p.indigenousIdentity).toEqual(null);
    });
  });

  describe('methods', () => {
    describe('setIdentity', () => {
      it('should set identity related attributes', () => {
        const p = new IdentitySet();
        p.setIdentity({ ...mockIdentitySetData(), name: 'dummy' } as IHoneyPotIdentitySet);
        expect(p.firstName).toEqual(mockIdentitySetData().firstName);
        expect(p.middleName).toEqual(mockIdentitySetData().middleName);
        expect(p.lastName).toEqual(mockIdentitySetData().lastName);
        expect(p.preferredName).toEqual(mockIdentitySetData().preferredName);
        expect(p.gender).toEqual(mockIdentitySetData().gender);
        expect(p.genderOther).toEqual(mockIdentitySetData().genderOther);
        expect(p.birthDate).toEqual(mockIdentitySetData().birthDate);
        expect(p.name).toEqual('dummy');
        expect(p.dateOfBirth).toEqual(helpers.getBirthDateUTCString(mockIdentitySetData().birthDate));
      });
    });

    describe('setIndigenousIdentity', () => {
      it('should set indigenous identity related attributes', () => {
        const p = new IdentitySet();
        p.setIndigenousIdentity(mockIdentitySetData());

        expect(p.indigenousProvince).toEqual(mockIdentitySetData().indigenousProvince);
        expect(p.indigenousType).toEqual(mockIdentitySetData().indigenousType);
        expect(p.indigenousCommunityId).toEqual(mockIdentitySetData().indigenousCommunityId);
        expect(p.indigenousCommunityOther).toEqual(mockIdentitySetData().indigenousCommunityOther);
        expect(p.indigenousIdentity).toEqual({
          indigenousCommunityId: mockIdentitySetData().indigenousCommunityId,
          specifiedOther: mockIdentitySetData().indigenousCommunityOther,
        });
      });
    });

    describe('validate', () => {
      describe('First name', () => {
        it('is required', () => {
          const p = new IdentitySet();
          let results = p.validate();
          expect(results).toContain('first name is required');

          p.firstName = 'first name';
          results = p.validate();
          expect(results).not.toContain('first name is required');
        });
        it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
          const p = new IdentitySet();
          p.firstName = longSmallText;

          expect(p.validate()).toContain(`first name exceeds max length of ${MAX_LENGTH_SM}`);
        });
      });

      describe('Middle name', () => {
        it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
          const p = new IdentitySet();
          p.middleName = longSmallText;

          expect(p.validate()).toContain(`middle name exceeds max length of ${MAX_LENGTH_SM}`);
        });
      });

      describe('Last name', () => {
        it('is required', () => {
          const p = new IdentitySet();
          let results = p.validate();
          expect(results).toContain('last name is required');

          p.lastName = 'last name';
          results = p.validate();
          expect(results).not.toContain('last name is required');
        });

        it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
          const p = new IdentitySet();
          p.lastName = longSmallText;

          expect(p.validate()).toContain(`last name exceeds max length of ${MAX_LENGTH_SM}`);
        });
      });

      describe('Preferred name', () => {
        it(`has a max of ${MAX_LENGTH_SM} characters`, () => {
          const p = new IdentitySet();
          p.preferredName = longSmallText;

          expect(p.validate()).toContain(`preferred name exceeds max length of ${MAX_LENGTH_SM}`);
        });
      });

      describe('Gender', () => {
        it('is required', () => {
          const p = new IdentitySet();
          let results = p.validate();
          expect(results).toContain('gender is required');

          p.gender = mockIdentitySetData().gender;
          results = p.validate();
          expect(results).not.toContain('gender is required');
        });
      });

      describe('Other gender', () => {
        it(`has a max of ${MAX_LENGTH_MD} characters if gender.isOther is true`, () => {
          const p = new IdentitySet();
          p.gender = mockGenderOther();
          p.genderOther = longText;

          expect(p.validate()).toContain(`other gender exceeds max length of ${MAX_LENGTH_MD}`);
        });

        it('is required if gender.isOther is true', () => {
          const p = new IdentitySet();
          p.gender = mockGenderOther();
          const results = p.validate();
          expect(results).toContain('genderOther is required');
        });

        it('is not required if gender.isOther is false', () => {
          const p = new IdentitySet();
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
          const p = new IdentitySet();
          let results = p.validate();
          expect(results).toContain('year is required');

          p.birthDate.year = 2000;
          results = p.validate();
          expect(results).not.toContain('year is required');
        });

        test('month is required', () => {
          const p = new IdentitySet();
          let results = p.validate();
          expect(results).toContain('month is required');

          p.birthDate.month = 2000;
          results = p.validate();
          expect(results).not.toContain('month is required');
        });

        test('day is required', () => {
          const p = new IdentitySet();
          let results = p.validate();
          expect(results).toContain('day is required');

          p.birthDate.day = 2000;
          results = p.validate();
          expect(results).not.toContain('day is required');
        });

        test('minimum age required if skipAgeRestriction is false', () => {
          const p = new IdentitySet();
          p.birthDate = {
            year: 2021,
            month: 1,
            day: 2,
          };
          const results = p.validate();
          expect(results).toContain('minimum age required');
        });

        test('minimum age required is skipped skipAgeRestriction is true', () => {
          const p = new IdentitySet();
          p.birthDate = {
            year: 2021,
            month: 1,
            day: 2,
          };
          const results = p.validate(true);
          expect(results).not.toContain('minimum age required');
        });

        test('Should return invalid if the year is negative', () => {
          const p = new IdentitySet();
          p.birthDate = {
            year: -1000,
            day: 1,
            month: 1,
          };
          const results = p.validate();
          expect(results).toContain('birth date not valid');
        });

        test('Should return valid if birthdate is ok', () => {
          const p = new IdentitySet();
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
          const p = new IdentitySet();
          let results = p.validate();
          expect(results).not.toContain('indigenousType is required');

          p.indigenousProvince = ECanadaProvinces.AB;
          results = p.validate();
          expect(results).toContain('indigenousType is required');
        });
      });

      describe('indigenousCommunityId', () => {
        it('is required if indigenousType is not null', () => {
          const p = new IdentitySet();
          let results = p.validate();
          expect(results).not.toContain('indigenousCommunityId is required');

          p.indigenousType = EIndigenousTypes.FirstNation;
          results = p.validate();
          expect(results).toContain('indigenousCommunityId is required');
        });

        it('is not required if indigenousType is other', () => {
          const p = new IdentitySet();
          p.indigenousType = EIndigenousTypes.Other;
          const results = p.validate();
          expect(results).not.toContain('indigenousCommunityId is required');
        });
      });

      describe('indigenousCommunityOther', () => {
        it('is required if indigenousType is other', () => {
          const p = new IdentitySet();
          p.indigenousType = EIndigenousTypes.Other;
          const results = p.validate();
          expect(results).toContain('indigenousCommunityOther is required');
        });

        it(`has a max of ${MAX_LENGTH_MD} characters`, () => {
          const p = new IdentitySet();
          p.indigenousType = EIndigenousTypes.Other;
          p.indigenousCommunityOther = longText;
          const results = p.validate();
          expect(results).toContain(`indigenousCommunityOther exceeds max length of ${MAX_LENGTH_MD}`);
        });
      });
    });
  });
});
