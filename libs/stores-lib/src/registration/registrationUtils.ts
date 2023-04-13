import { IHouseholdCreate } from '@libs/entities-lib/household-create';
import { ERegistrationMethod, ERegistrationMode } from '@libs/shared-lib/types';

export const isRegisteredValid = (): boolean => true;

export const privacyStatementValid = (
  { mode, isPrivacyAgreed, householdCreate }: { mode: ERegistrationMode, isPrivacyAgreed: boolean; householdCreate: IHouseholdCreate },
): boolean => {
  let isValid = false;
  if (mode === ERegistrationMode.Self) {
    isValid = isPrivacyAgreed;
  } else if (mode === ERegistrationMode.CRC) {
    if (!isPrivacyAgreed) {
      isValid = false;
    } else if (!householdCreate.consentInformation.crcUserName) {
      isValid = false;
    } else if (householdCreate.consentInformation.registrationMethod === null) {
      isValid = false;
    } else if (householdCreate.consentInformation.registrationMethod === ERegistrationMethod.InPerson) {
      isValid = householdCreate.consentInformation.registrationLocationId !== null;
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

export const keysForDuplicateErrors = [
  'errors.the-beneficiary-have-duplicate-first-name-last-name-birthdate',
  'errors.the-beneficiary-have-duplicate-first-name-last-name-phone-number',
  'errors.the-household-have-duplicate-first-name-last-name-birthdate',
  'errors.the-email-provided-already-exists-in-the-system',
  'errors.person-identified-as-duplicate',
];
