import { mockHouseholdCreate } from '@libs/entities-lib/household-create';
import { ERegistrationMethod, ERegistrationMode } from '@libs/core-lib/types';
import {
  addressesValid,
  additionalMembersValid,
  isRegisteredValid,
  personalInformationValid,
  privacyStatementValid,
  reviewRegistrationValid,
} from './registrationUtils';
import { IState } from './registration.types';

const household = mockHouseholdCreate();

describe('>>> Registration utils', () => {
  describe('isRegisteredValid', () => {
    it('should return true', () => {
      const isValid = isRegisteredValid();
      expect(isValid).toEqual(true);
    });
  });

  describe('privacyStatementValid', () => {
    describe('Household registration', () => {
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

      it('should return false if CRC user name is empty, undefined or null', () => {
        const mode = ERegistrationMode.CRC;
        const state = {
          isPrivacyAgreed: true,
          householdCreate: {
            consentInformation: {
              crcUserName: '',
            },
          },
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(false);
      });

      it('should return false registration method is null', () => {
        const mode = ERegistrationMode.CRC;
        const state = {
          isPrivacyAgreed: true,
          householdCreate: {
            consentInformation: {
              registrationMethod: null,
            },
          },
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(false);
      });

      it('should return false registration method is InPerson and registration location is empty', () => {
        const mode = ERegistrationMode.CRC;
        const state = {
          isPrivacyAgreed: true,
          householdCreate: {
            consentInformation: {
              registrationMethod: ERegistrationMethod.InPerson,
              registrationLocationId: null,
            },
          },
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(false);
      });

      it('should return true otherwise', () => {
        const mode = ERegistrationMode.CRC;
        const state = {
          isPrivacyAgreed: true,
          householdCreate: {
            consentInformation: {
              registrationMethod: ERegistrationMethod.InPerson,
              registrationLocationId: 'id',
              crcUserName: 'Mister test',
            },
          },
        } as IState;

        const isValid = privacyStatementValid(mode, state);
        expect(isValid).toEqual(true);
      });
    });
  });

  describe('personalInformationValid', () => {
    it('should return the result of household validatePersonalInformation method', () => {
      const isValid = personalInformationValid(household, false, false);
      const expected = household.validatePersonalInformation(false, false);
      expect(isValid).toEqual(expected.length === 0);
    });
  });

  describe('addressesValid', () => {
    it('should return the result of household validateAddresses method', () => {
      const isValid = addressesValid(household, false);
      const expected = household.validateAddresses(false);
      expect(isValid).toEqual(expected.length === 0);
    });
  });

  describe('additionalMembersValid', () => {
    it('should return the result of household validateAdditionalMembers method', () => {
      const isValid = additionalMembersValid(household);
      const expected = household.validateAdditionalMembers();
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
