import { ERegistrationMethod, ERegistrationMode } from '../../../types';
import { IState } from './registration.types';
import { IHouseholdCreate } from '../../../entities/household-create';

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
export const personalInformationValid = (household: IHouseholdCreate, skipAgeRestriction: boolean, skipEmailPhoneRules: boolean): boolean => household.validatePersonalInformation(skipAgeRestriction, skipEmailPhoneRules).length === 0;

export const addressesValid = (household: IHouseholdCreate, noFixedHome: boolean): boolean => household.validateAddresses(noFixedHome).length === 0;

export const additionalMembersValid = (household: IHouseholdCreate): boolean => household.validateAdditionalMembers().length === 0;

export const reviewRegistrationValid = (): boolean => true;
