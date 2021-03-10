import { IEntity } from '@/types';
import { IPersonalInformation } from './personalInformation/personalInformation.types';
import { IAddresses } from './addresses/addresses.types';
import { IPrivacyStatement } from './privacyStatement/privacyStatement.types';
import { IHouseholdMembers } from './householdMembers/householdMembers.types.';
import { IReviewRegistration } from './reviewRegistration/reviewRegistration.types';

/**
 * Enums
 */

/**
 * Value objects
 */

/**
 * Interface that maps to the response structure from the API
 */

/**
 * Interface used for the entity class
 */

export interface IBeneficiary extends IEntity {
  privacyStatement: IPrivacyStatement;
  personalInformation: IPersonalInformation;
  addresses: IAddresses;
  householdMembers: IHouseholdMembers;
  reviewRegistration: IReviewRegistration;
}
