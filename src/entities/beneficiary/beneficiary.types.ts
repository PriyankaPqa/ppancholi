import { IEntity } from '@/types';
import { IPersonData, IPerson } from '@/entities/beneficiary/person';
import { IContactInformation, IContactInformationData } from './contactInformation/contactInformation.types';
import { IAddresses, IAddressesData } from './addresses/addresses.types';
import { IHouseholdMembers, IHouseholdMembersData } from './householdMembers/householdMembers.types.';

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
  person: IPersonData
  contactInformation: IContactInformationData;
  addresses: IAddressesData;
  householdMembers: IHouseholdMembersData;
}

export interface IBeneficiary extends IEntity {
  person: IPerson
  contactInformation: IContactInformation;
  addresses: IAddresses;
  householdMembers: IHouseholdMembers;
}
