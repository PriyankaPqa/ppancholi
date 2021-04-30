import { MAX_LENGTH_MD } from '../../../constants/validations';
import { EPhoneTypes } from '../../beneficiary';
import { mockContactInformation, mockContactInformationData } from './contactInformation.mock';
import { ContactInformation } from './contactInformation';

const longText = 'x'.repeat(MAX_LENGTH_MD + 1);
const mockData = mockContactInformationData();

describe('>>> ContactInformation', () => {
  describe('>>constructor', () => {
    it('should initialize data if passed', () => {
      const p = new ContactInformation(mockData);
      expect(p).toEqual(mockContactInformation());
    });

    it('should reset if not data pass', () => {
      const p = new ContactInformation();
      expect(p.mobilePhone).toEqual({
        number: '',
        phoneNumberType: EPhoneTypes.Mobile,
        countryISO2: 'CA',
        e164Number: '',
      });
      expect(p.homePhone).toEqual({
        number: '',
        phoneNumberType: EPhoneTypes.Home,
        countryISO2: 'CA',
        e164Number: '',
      });
      expect(p.otherPhone).toEqual({
        number: '',
        phoneNumberType: EPhoneTypes.Other,
        countryISO2: 'CA',
        e164Number: '',
      });
      expect(p.otherPhoneExtension).toEqual('');
      expect(p.email).toEqual('');
      expect(p.preferredLanguage).toEqual(null);
      expect(p.preferredLanguageOther).toEqual('');
      expect(p.primarySpokenLanguage).toEqual(null);
      expect(p.primarySpokenLanguageOther).toEqual('');
    });
  });

  describe('>> validation', () => {
    describe('mobilePhone', () => {
      it('should be valid', () => {
        const p = new ContactInformation();
        p.mobilePhone = {
          countryISO2: 'CA',
          number: '123',
          e164Number: '234',
        };

        expect(p.validate(false)).toContain('mobile phone not valid');
      });
    });

    describe('homePhone', () => {
      it('should be valid', () => {
        const p = new ContactInformation();
        p.homePhone = {
          countryISO2: 'CA',
          number: '123',
          e164Number: '234',
        };

        expect(p.validate(false)).toContain('home phone not valid');
      });
    });

    describe('otherPhone', () => {
      it('should be valid', () => {
        const p = new ContactInformation();
        p.otherPhone = {
          countryISO2: 'CA',
          number: '123',
          e164Number: '234',
        };

        expect(p.validate(false)).toContain('other phone not valid');
      });
    });

    describe('otherPhoneExtension', () => {
      it(`has a max of ${MAX_LENGTH_MD} characters`, () => {
        const p = new ContactInformation();
        p.otherPhoneExtension = longText;

        expect(p.validate(false)).toContain(`other phone extension exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });

    describe('Email', () => {
      it('should be valid', () => {
        const p = new ContactInformation();
        p.email = 'abcd';

        expect(p.validate(false)).toContain('email not valid');
      });
      it(`has a max of ${MAX_LENGTH_MD} characters`, () => {
        const p = new ContactInformation();
        p.email = longText;

        expect(p.validate(false)).toContain(`email exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });

    describe('preferredLanguage', () => {
      it('is required', () => {
        const p = new ContactInformation();
        let results = p.validate(false);
        expect(results).toContain('preferred language is required');

        p.preferredLanguage = mockData.preferredLanguage;
        results = p.validate(false);
        expect(results).not.toContain('preferred language is required');
      });
    });

    describe('preferredLanguageOther', () => {
      it('is required', () => {
        const p = new ContactInformation();
        let results = p.validate(false);
        expect(results).toContain('preferred language is required');

        p.preferredLanguage = mockData.preferredLanguage;
        results = p.validate(false);
        expect(results).not.toContain('preferred language is required');
      });

      it(`has a max of ${MAX_LENGTH_MD} characters`, () => {
        const p = new ContactInformation();
        p.preferredLanguageOther = longText;

        expect(p.validate(false)).toContain(`other preferred language exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });

    describe('primarySpokenLanguageOther', () => {
      it(`has a max of ${MAX_LENGTH_MD} characters`, () => {
        const p = new ContactInformation();
        p.primarySpokenLanguageOther = longText;

        expect(p.validate(false)).toContain(`other primary spoken language exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });

    describe('Only if skipEmailPhoneRules is false', () => {
      describe('hasAtLeastAPhoneIfNoEmail', () => {
        it('should return true if no email', () => {
          const p = new ContactInformation();
          expect(p.validate(false)).toContain('at least one phone is required if no email');
        });

        it('should return false if email', () => {
          const p = new ContactInformation();
          p.email = 'test@test.ca';
          expect(p.validate(false)).not.toContain('at least phone is required if no email');
        });

        it('should return false if mobilePhone', () => {
          const p = new ContactInformation();
          p.mobilePhone.number = '123';
          expect(p.validate(false)).not.toContain('at least phone is required if no email');
        });

        it('should return false if otherPhone', () => {
          const p = new ContactInformation();
          p.otherPhone.number = '123';
          expect(p.validate(false)).not.toContain('at least phone is required if no email');
        });

        it('should return false if homePhone', () => {
          const p = new ContactInformation();
          p.homePhone.number = '123';
          expect(p.validate(false)).not.toContain('at least phone is required if no email');
        });
      });

      describe('isEmailRequired', () => {
        it('should return true if no phone', () => {
          const p = new ContactInformation();
          expect(p.validate(false)).toContain('email is required if no phone');
        });

        it('should return false if homePhone', () => {
          const p = new ContactInformation();
          p.homePhone.number = '123';
          expect(p.validate(false)).not.toContain('email is required if no phone');
        });

        it('should return false if otherPhone', () => {
          const p = new ContactInformation();
          p.otherPhone.number = '123';
          expect(p.validate(false)).not.toContain('email is required if no phone');
        });

        it('should return false if mobilePhone', () => {
          const p = new ContactInformation();
          p.mobilePhone.number = '123';
          expect(p.validate(false)).not.toContain('email is required if no phone');
        });

        it('should return false if email', () => {
          const p = new ContactInformation();
          p.email = 'test@test.ca';
          expect(p.validate(false)).not.toContain('email is required if no phone');
        });
      });
    });
  });
});
