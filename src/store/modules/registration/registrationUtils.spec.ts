import { mockBeneficiary } from '@/entities/beneficiary';
import { ERegistrationMethod, ERegistrationMode } from '@/types';
import {
  addressesValid,
  householdMembersValid,
  isRegisteredValid,
  personalInformationValid,
  privacyStatementValid,
  reviewRegistrationValid,
} from './registrationUtils';
import { IState } from './registration.types';

const beneficiary = mockBeneficiary();

describe('>>> Registration utils', () => {
  describe('isRegisteredValid', () => {
    it('should return true', () => {
      const isValid = isRegisteredValid();
      expect(isValid).toEqual(true);
    });
  });

  describe('privacyStatementValid', () => {
    describe('Beneficiary registration', () => {
      it('should return true if privacy statement is checked', () => {
        const mode = ERegistrationMode.Self;
        const state = {
          isPrivacyAgreed: true,
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(true);
      });

      it('should return false if privacy statement is not checked', () => {
        const mode = ERegistrationMode.Self;
        const state = {
          isPrivacyAgreed: false,
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(false);
      });
    });

    describe('CRC registration', () => {
      it('should return false if privacy statement is not checked', () => {
        const mode = ERegistrationMode.CRC;
        const state = {
          isPrivacyAgreed: false,
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(false);
      });

      it('should return false registration method is null', () => {
        const mode = ERegistrationMode.CRC;
        const state = {
          isPrivacyAgreed: true,
          privacyRegistrationMethod: null,
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(false);
      });

      it('should return false registration method is InPerson and registration location is empty', () => {
        const mode = ERegistrationMode.CRC;
        const state = {
          isPrivacyAgreed: true,
          privacyRegistrationMethod: ERegistrationMethod.InPerson,
          privacyRegistrationLocationName: '',
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(false);
      });

      it('should return true otherwise', () => {
        const mode = ERegistrationMode.CRC;
        const state = {
          isPrivacyAgreed: true,
          privacyRegistrationMethod: ERegistrationMethod.InPerson,
          privacyRegistrationLocationName: 'location',
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(true);
      });
    });
  });

  describe('personalInformationValid', () => {
    it('should return the result of beneficiary validatePersonalInformation method', () => {
      const isValid = personalInformationValid(beneficiary, false, false);
      const expected = beneficiary.validatePersonalInformation(false, false);
      expect(isValid).toEqual(expected.length === 0);
    });
  });

  describe('addressesValid', () => {
    it('should return the result of beneficiary validateAddresses method', () => {
      const isValid = addressesValid(beneficiary, false);
      const expected = beneficiary.validateAddresses(false);
      expect(isValid).toEqual(expected.length === 0);
    });
  });

  describe('householdMembersValid', () => {
    it('should return the result of beneficiary validateHouseholdMembers method', () => {
      const isValid = householdMembersValid(beneficiary);
      const expected = beneficiary.validateHouseholdMembers();
      expect(isValid).toEqual(expected.length === 0);
    });
  });

  describe('reviewRegistrationValid', () => {
    it('should return true', () => {
      const isValid = reviewRegistrationValid();
      expect(isValid).toEqual(true);
    });
  });
});
