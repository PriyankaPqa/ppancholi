import { IEntity } from '../../types';
import { IPersonData, IPerson } from '../value-objects/person';
import { IContactInformation, IContactInformationData } from '../value-objects/contact-information/contactInformation.types';
import { IAddress, IAddressData } from '../value-objects/address/address.types';

export interface IBeneficiaryData {
  person: IPersonData;
  contactInformation: IContactInformationData;
  homeAddress: IAddressData;
  householdMembers: IPersonData[];
}

export interface IBeneficiary extends IEntity {
  person: IPerson;
  contactInformation: IContactInformation;
  homeAddress: IAddress;
  householdMembers: IPerson[];

  addHouseholdMember(newPerson: IPerson, sameAddress: boolean): void;
  removeHouseholdMember(index: number): void;
  editHouseholdMember(newPerson: IPerson, index: number, sameAddress: boolean): void;
  validateHouseholdMembers(): void;
  validateContactInformationAndIdentity(skipAgeRestriction: boolean): string[];
  booleanContactInformationAndIdentityIsValid(): boolean;
  booleanAddressesIsValid(noFixedHome: boolean): boolean;
  booleanHouseholdMembersIsValid(): boolean;
}
