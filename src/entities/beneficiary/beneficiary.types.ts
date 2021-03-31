import { IEntity } from '@/types';
import { IPersonalInformation } from './personalInformation/personalInformation.types';
import { IAddresses } from './addresses/addresses.types';
import { IHouseholdMembers } from './householdMembers/householdMembers.types.';

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

export interface IBeneficiaryData {
  personalInformation: IPersonalInformation;
  addresses: IAddresses;
  householdMembers: IHouseholdMembers;
}

export interface IBeneficiary extends IEntity {
  personalInformation: IPersonalInformation;
  addresses: IAddresses;
  householdMembers: IHouseholdMembers;
}
