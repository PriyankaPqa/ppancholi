import { IContactInformation } from '@/entry';
import { MAX_LENGTH_MD } from '../../../constants/validations';
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
      expect(p.mobilePhoneNumber).toEqual({
        number: '',
        countryCode: 'CA',
        e164Number: '',
        extension: '',
      });
      expect(p.homePhoneNumber).toEqual({
        number: '',
        countryCode: 'CA',
        e164Number: '',
        extension: '',
      });
      expect(p.alternatePhoneNumber).toEqual({
        number: '',
        countryCode: 'CA',
        e164Number: '',
        extension: '',
      });
      expect(p.email).toEqual('');
      expect(p.preferredLanguage).toEqual(null);
      expect(p.preferredLanguageOther).toEqual(null);
      expect(p.primarySpokenLanguage).toEqual(null);
      expect(p.primarySpokenLanguageOther).toEqual(null);
    });

    it('should reset if data passed not complete', () => {
      const p = new ContactInformation({} as IContactInformation);
      expect(p.mobilePhoneNumber).toEqual({
        number: '',
        countryCode: 'CA',
        e164Number: '',
        extension: '',
      });
      expect(p.homePhoneNumber).toEqual({
        number: '',
        countryCode: 'CA',
        e164Number: '',
        extension: '',
      });
      expect(p.alternatePhoneNumber).toEqual({
        number: '',
        countryCode: 'CA',
        e164Number: '',
        extension: '',
      });
      expect(p.email).toEqual('');
      expect(p.preferredLanguage).toEqual(null);
      expect(p.preferredLanguageOther).toEqual(null);
      expect(p.primarySpokenLanguage).toEqual(null);
      expect(p.primarySpokenLanguageOther).toEqual(null);
    });
  });

  describe('>> validation', () => {
    describe('mobilePhoneNumber', () => {
      it('should be valid', () => {
        const p = new ContactInformation();
        p.mobilePhoneNumber = {
          countryCode: 'CA',
          number: '123',
          e164Number: '234',
        };

        expect(p.validate(false)).toContain('mobile phone not valid');
      });
    });

    describe('homePhoneNumber', () => {
      it('should be valid', () => {
        const p = new ContactInformation();
        p.homePhoneNumber = {
          countryCode: 'CA',
          number: '123',
          e164Number: '234',
        };

        expect(p.validate(false)).toContain('home phone not valid');
      });
    });

    describe('alternatePhoneNumber', () => {
      it('should be valid', () => {
        const p = new ContactInformation();
        p.alternatePhoneNumber = {
          countryCode: 'CA',
          number: '123',
          e164Number: '234',
        };

        expect(p.validate(false)).toContain('other phone not valid');
      });
    });

    describe('alternatePhoneNumber extension', () => {
      it(`has a max of ${MAX_LENGTH_MD} characters`, () => {
        const p = new ContactInformation();
        p.alternatePhoneNumber.extension = longText;

        expect(p.validate(false)).toContain(`alternate phone extension exceeds max length of ${MAX_LENGTH_MD}`);
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

      it('is specified if select other', () => {
        const p = new ContactInformation();
        p.primarySpokenLanguage = {
          isOther: true,
          specifiedOther: null,
          id: '',
          name: null,
          orderRank: 1,
          isDefault: false,
        };
        p.primarySpokenLanguageOther = null;

        expect(p.validate(false)).toContain('other primary spoken language is required');
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

        it('should return false if mobilePhoneNumber', () => {
          const p = new ContactInformation();
          p.mobilePhoneNumber.number = '123';
          expect(p.validate(false)).not.toContain('at least phone is required if no email');
        });

        it('should return false if alternatePhoneNumber', () => {
          const p = new ContactInformation();
          p.alternatePhoneNumber.number = '123';
          expect(p.validate(false)).not.toContain('at least phone is required if no email');
        });

        it('should return false if homePhoneNumber', () => {
          const p = new ContactInformation();
          p.homePhoneNumber.number = '123';
          expect(p.validate(false)).not.toContain('at least phone is required if no email');
        });
      });

      describe('isEmailRequired', () => {
        it('should return true if no phone', () => {
          const p = new ContactInformation();
          expect(p.validate(false)).toContain('email is required if no phone');
        });

        it('should return false if homePhoneNumber', () => {
          const p = new ContactInformation();
          p.homePhoneNumber.number = '123';
          expect(p.validate(false)).not.toContain('email is required if no phone');
        });

        it('should return false if alternatePhoneNumber', () => {
          const p = new ContactInformation();
          p.alternatePhoneNumber.number = '123';
          expect(p.validate(false)).not.toContain('email is required if no phone');
        });

        it('should return false if mobilePhoneNumber', () => {
          const p = new ContactInformation();
          p.mobilePhoneNumber.number = '123';
          expect(p.validate(false)).not.toContain('email is required if no phone');
        });

        it('should return false if email', () => {
          const p = new ContactInformation();
          p.email = 'test@test.ca';
          expect(p.validate(false)).not.toContain('email is required if no phone');
        });
      });

      describe('emailValidatedByBackend', () => {
        it('should be valid', () => {
          const p = new ContactInformation();

          expect(p.validate(false)).not.toContain('invalid email');
        });

        it('should not be valid', () => {
          const p = new ContactInformation();

          p.emailValidatedByBackend = false;

          expect(p.validate(false)).toContain('invalid email');
        });
      });
    });
  });
});
