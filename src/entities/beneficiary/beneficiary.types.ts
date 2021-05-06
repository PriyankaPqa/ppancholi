import { IPersonData, IPerson, IPersonForCreate } from '../value-objects/person';
import {
  IContactInformation,
  IContactInformationData,
  IContactInformationForCreate,
} from '../value-objects/contact-information/contactInformation.types';
import { IAddress, IAddressData } from '../value-objects/address/address.types';

export interface IBeneficiaryData {
  person: IPersonData;
  noFixedHome: boolean;
  contactInformation: IContactInformationData;
  homeAddress: IAddressData;
  householdMembers: IPersonData[];
}

export interface IBeneficiary {
  person: IPerson;
  noFixedHome: boolean;
  contactInformation: IContactInformation;
  homeAddress: IAddress;
  householdMembers: IPerson[];

  addHouseholdMember(newPerson: IPerson, sameAddress: boolean): void;
  removeHouseholdMember(index: number): void;
  editHouseholdMember(newPerson: IPerson, index: number, sameAddress: boolean): void;
  validatePersonalInformation(skipAgeRestriction: boolean, skipEmailPhoneRules: boolean): string[];
  validateAddresses(noFixedHome: boolean): string[];
  validateHouseholdMembers(): string[];
  // eslint-disable-next-line
  validate({
    noFixedHome,
    skipAgeRestriction,
    skipEmailPhoneRules,
  }: {
    noFixedHome: boolean;
    skipAgeRestriction: boolean;
    skipEmailPhoneRules: boolean;
  }): string[];
}

export interface ICreateBeneficiaryRequest {
  person: IPersonForCreate;
  noFixedHome: boolean;
  contactInformation: IContactInformationForCreate;
  homeAddress: IAddressData;
  householdMembers: IPersonForCreate[];
  eventId: uuid;
}
