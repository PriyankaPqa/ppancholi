import { ERegistrationMethod, ERegistrationMode } from '../../../types';
import { IState } from './registration.types';
import { IBeneficiary } from '../../../entities/beneficiary';

export const isRegisteredValid = (): boolean => true;

export const privacyStatementValid = (mode: ERegistrationMode, state: IState): boolean => {
  let isValid = false;
  if (mode === ERegistrationMode.Self) {
    isValid = state.isPrivacyAgreed;
  } else if (mode === ERegistrationMode.CRC) {
    if (!state.isPrivacyAgreed) {
      isValid = false;
    } else if (state.privacyRegistrationMethod === null) {
      isValid = false;
    } else if (state.privacyRegistrationMethod === ERegistrationMethod.InPerson) {
      isValid = state.privacyRegistrationLocationName !== '';
    } else {
      isValid = true;
    }
  }
  return isValid;
};

// eslint-disable-next-line
export const personalInformationValid = (beneficiary: IBeneficiary, skipAgeRestriction: boolean, skipEmailPhoneRules: boolean): boolean => beneficiary.validatePersonalInformation(skipAgeRestriction, skipEmailPhoneRules).length === 0;

export const addressesValid = (beneficiary: IBeneficiary, noFixedHome: boolean): boolean => beneficiary.validateAddresses(noFixedHome).length === 0;

export const householdMembersValid = (beneficiary: IBeneficiary): boolean => beneficiary.validateHouseholdMembers().length === 0;

export const reviewRegistrationValid = (): boolean => true;
