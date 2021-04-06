import { IEntity } from '@/types';
import { IPersonData, IPerson } from '@/entities/value-objects/person';
import { IContactInformation, IContactInformationData } from '../value-objects/contact-information/contactInformation.types';
import { IAddress, IAddressData } from '../value-objects/address/address.types';
import { IHouseholdMembers, IHouseholdMembersData } from '../value-objects/household-members/householdMembers.types';

export interface IBeneficiaryData {
  person: IPersonData
  contactInformation: IContactInformationData;
  homeAddress: IAddressData;
  householdMembers: IHouseholdMembersData;
}

export interface IBeneficiary extends IEntity {
  person: IPerson
  contactInformation: IContactInformation;
  homeAddress: IAddress;
  householdMembers: IHouseholdMembers;
}
